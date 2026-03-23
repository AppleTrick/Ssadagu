package com.twotwo.ssadagu.domain.transaction.service;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import com.twotwo.ssadagu.domain.account.repository.UserAccountRepository;
import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.repository.ChatRoomRepository;
import com.twotwo.ssadagu.domain.chat.service.ChatMessageService;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionRequestDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.transaction.entity.Transaction;
import com.twotwo.ssadagu.domain.transaction.repository.TransactionRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import com.twotwo.ssadagu.global.dto.SsafyApiResponse;
import com.twotwo.ssadagu.global.error.BusinessException;
import com.twotwo.ssadagu.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserAccountRepository userAccountRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageService chatMessageService;
    private final DemandDepositService demandDepositService;

    /**
     * 결제 요청 (판매자가 구매자에게)
     */
    @Transactional
    public void requestPayment(Long productId, Long sellerId, Long buyerId, Long roomId) {
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BusinessException(ErrorCode.NOT_PRODUCT_SELLER);
        }

        if (!"ON_SALE".equals(product.getStatus())) {
            throw new BusinessException(ErrorCode.PRODUCT_ALREADY_TRADING);
        }

        // 상태 변경: 거래중(TRADING)
        product.reserve();

        // 채팅 메시지 발송 (결제 요청 타입)
        chatMessageService.sendSystemMessage(roomId, "판매자가 결제를 요청했습니다.", ChatMessage.MessageType.PAYMENT_REQUEST);
        
        log.info("[Transaction] 결제 요청 완료 - 상품ID: {}, 판매자: {}, 구매자: {}", productId, sellerId, buyerId);
    }

    /**
     * 결제 승인 (구매자가 이체 실행 및 확정)
     */
    @Transactional
    public TransactionResponseDto approvePayment(TransactionRequestDto request, Long currentUserId) {
        Product product = productRepository.findByIdWithLock(request.getProductId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!"TRADING".equals(product.getStatus())) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_TRADING);
        }

        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        if (!buyer.getId().equals(currentUserId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        User seller = product.getSeller();

        // 계좌 정보 조회
        UserAccount buyerAccount = userAccountRepository.findByUserId(buyer.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        UserAccount sellerAccount = userAccountRepository.findByUserId(seller.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));

        // 0. 금액 검증: 0원 이하인 경우만 체크 (보안 강화 및 비정상 거래 방지)
        if (request.getAmount() == null || request.getAmount() <= 0) {
            log.error("[Transaction] 결제 금액 오류 - 요청금액: {}", request.getAmount());
            throw new BusinessException(ErrorCode.INVALID_TRANSACTION_AMOUNT);
        }

        if (!product.getPrice().equals(request.getAmount())) {
            log.info("[Transaction] 상품 가격과 결제 요청 금액이 다름 (네고 적용 가능) - 상품가격: {}, 요청금액: {}", 
                product.getPrice(), request.getAmount());
        }

        Long roomId = chatRoomRepository.findByProductIdAndBuyerId(product.getId(), buyer.getId())
                .map(room -> room.getId())
                .orElse(null);

        // 1. SSAFY 금융망 이체 실행 (요청된 결제 금액 사용)
        try {
            Long transferAmount = request.getAmount();
            log.info("[Transaction Debug] 이체 요청 정보 - 구매자계좌: {}, 판매자계좌: {}, 금액: {}, UserKey: {}", 
                buyerAccount.getAccountNumber(), sellerAccount.getAccountNumber(), transferAmount, buyer.getUserKey());

            SsafyApiResponse<List<Map<String, Object>>> apiResponse = demandDepositService.updateTransfer(
                    sellerAccount.getAccountNumber(), "싸다구 판매대금",
                    buyerAccount.getAccountNumber(), "싸다구 물품결제",
                    transferAmount, buyer.getUserKey()
            );

            // API 결과 검증
            if (apiResponse == null || apiResponse.getHeader() == null || !"H0000".equals(apiResponse.getHeader().getResponseCode())) {
                String errorMsg = (apiResponse != null && apiResponse.getHeader() != null) 
                    ? apiResponse.getHeader().getResponseMessage() : "금융망 응답 없음";
                
                log.error("[싸피 금융망 거절 사유] 응답코드: {}, 에러내용: {}", 
                    apiResponse != null && apiResponse.getHeader() != null ? apiResponse.getHeader().getResponseCode() : "null", 
                    errorMsg);

                // 화면에 상세 원인을 뿌려주기 위해 메시지 보강
                throw new BusinessException(ErrorCode.TRANSACTION_FAILED, 
                    String.format("금융망 거절[%s]: 구매자(%s), 판매자(%s), 금액(%d원)", 
                        errorMsg, buyerAccount.getAccountNumber(), sellerAccount.getAccountNumber(), transferAmount));
            }

            // 2. 거래 기록 저장
            List<Map<String, Object>> recList = apiResponse.getRec();
            String bankTransactionId = "BTX-" + System.currentTimeMillis();
            if (recList != null && !recList.isEmpty() && recList.get(0) != null && recList.get(0).get("transactionUniqueNo") != null) {
                bankTransactionId = String.valueOf(recList.get(0).get("transactionUniqueNo"));
            }

            Transaction transaction = Transaction.builder()
                    .product(product)
                    .buyer(buyer)
                    .seller(seller)
                    .amount(transferAmount)
                    .paymentMethod("TRANSFER")
                    .bankTransactionId(bankTransactionId)
                    .status("COMPLETED")
                    .build();

            Transaction savedTransaction = transactionRepository.save(transaction);

            // 3. 상품 상태 변경: 판매완료(SOLD)
            product.soldOut();

            // 4. 채팅 알림 (결제 성공)
            if (roomId != null) {
                chatMessageService.sendSystemMessage(roomId, "결제가 완료되었습니다.", ChatMessage.MessageType.PAYMENT_SUCCESS);
            }

            log.info("[Transaction] 결제 승인 완료 - 거래ID: {}", savedTransaction.getId());
            return TransactionResponseDto.from(savedTransaction, currentUserId);

        } catch (Exception e) {
            log.error("[Transaction] 결제 승인 중 오류 발생: {}", e.getMessage());
            // FR-PAY-07: 결제 실패 알림 발송
            if (roomId != null) {
                chatMessageService.sendSystemMessage(roomId, "결제 처리에 실패했습니다. 다시 시도해주세요.", ChatMessage.MessageType.PAYMENT_FAIL);
            }
            throw e;
        }
    }

    /**
     * 거래 취소 (FR-PAY-08)
     */
    @Transactional
    public void cancelPayment(Long productId, Long currentUserId, Long roomId) {
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        // 권한 확인: 판매자 혹은 구매자만 취소 가능
        Long buyerId = chatRoomRepository.findById(roomId)
                .map(room -> room.getBuyer().getId())
                .orElse(null);

        if (!product.getSeller().getId().equals(currentUserId) && !currentUserId.equals(buyerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        if (!"TRADING".equals(product.getStatus())) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_TRADING);
        }

        // 상태 롤백: 판매중(ON_SALE)
        product.cancelReservation();

        // 채팅 알림
        chatMessageService.sendSystemMessage(roomId, "거래가 취소되었습니다. 상품이 다시 판매 중 상태로 변경됩니다.", ChatMessage.MessageType.SYSTEM);
        
        log.info("[Transaction] 거래 취소 완료 - 상품ID: {}, 요청자: {}", productId, currentUserId);
    }

    /**
     * 거래 내역 조회 (FR-PAY-06)
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<TransactionResponseDto> getTransactionHistory(Long userId, String type, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<com.twotwo.ssadagu.domain.transaction.entity.Transaction> transactions;
        if ("BUY".equalsIgnoreCase(type)) {
            transactions = transactionRepository.findByBuyerId(userId, pageable);
        } else if ("SELL".equalsIgnoreCase(type)) {
            transactions = transactionRepository.findBySellerId(userId, pageable);
        } else {
            transactions = transactionRepository.findByUserId(userId, pageable);
        }

        return transactions.map(t -> TransactionResponseDto.from(t, userId));
    }
}
