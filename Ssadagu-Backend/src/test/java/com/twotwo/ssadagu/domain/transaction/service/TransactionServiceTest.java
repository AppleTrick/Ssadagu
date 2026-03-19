package com.twotwo.ssadagu.domain.transaction.service;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import com.twotwo.ssadagu.domain.account.repository.UserAccountRepository;
import com.twotwo.ssadagu.domain.chat.repository.ChatRoomRepository;
import com.twotwo.ssadagu.domain.chat.service.ChatMessageService;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionRequestDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.transaction.repository.TransactionRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import com.twotwo.ssadagu.global.error.BusinessException;
import com.twotwo.ssadagu.global.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @InjectMocks
    private TransactionService transactionService;

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserAccountRepository userAccountRepository;
    @Mock
    private ChatRoomRepository chatRoomRepository;
    @Mock
    private ChatMessageService chatMessageService;
    @Mock
    private DemandDepositService demandDepositService;

    @Test
    @DisplayName("결제 요청 성공 - 상품 상태가 TRADING으로 변경되어야 함")
    void requestPayment_success() {
        // given
        User seller = User.builder().id(1L).build();
        Product product = Product.builder().id(100L).seller(seller).status("ON_SALE").build();
        
        given(productRepository.findByIdWithLock(100L)).willReturn(Optional.of(product));

        // when
        transactionService.requestPayment(100L, 1L, 2L, 5L);

        // then
        assertThat(product.getStatus()).isEqualTo("TRADING");
        verify(chatMessageService, times(1)).sendSystemMessage(any(), any(), any());
    }

    @Test
    @DisplayName("결제 요청 실패 - 판매자가 아닌 경우")
    void requestPayment_fail_not_seller() {
        // given
        User seller = User.builder().id(1L).build();
        Product product = Product.builder().id(100L).seller(seller).status("ON_SALE").build();
        
        given(productRepository.findByIdWithLock(100L)).willReturn(Optional.of(product));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class, () -> 
            transactionService.requestPayment(100L, 999L, 2L, 5L)
        );
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.NOT_PRODUCT_SELLER);
    }

    @Test
    @DisplayName("결제 승인 성공 - 이체 API 연동 및 거래 저장 확인")
    void approvePayment_success() {
        // given
        User seller = User.builder().id(1L).userKey("seller-key").build();
        User buyer = User.builder().id(2L).userKey("buyer-key").build();
        Product product = Product.builder().id(100L).seller(seller).status("TRADING").build();
        
        UserAccount buyerAcc = UserAccount.builder().accountNumber("111-222").build();
        UserAccount sellerAcc = UserAccount.builder().accountNumber("333-444").build();

        TransactionRequestDto request = TransactionRequestDto.builder()
                .productId(100L).buyerId(2L).amount(10000L).build();

        given(productRepository.findByIdWithLock(100L)).willReturn(Optional.of(product));
        given(userRepository.findById(2L)).willReturn(Optional.of(buyer));
        given(userAccountRepository.findByUserId(1L)).willReturn(Optional.of(sellerAcc));
        given(userAccountRepository.findByUserId(2L)).willReturn(Optional.of(buyerAcc));

        // API Response mock
        com.twotwo.ssadagu.global.dto.SsafyApiResponse<Map<String, Object>> apiResponse = com.twotwo.ssadagu.global.dto.SsafyApiResponse.<Map<String, Object>>builder()
                .header(com.twotwo.ssadagu.global.dto.SsafyApiResponse.SsafyHeader.builder().responseCode("0000").build())
                .rec(Map.of("transactionUniqueNo", "TX12345"))
                .build();
        
        given(demandDepositService.updateTransfer(any(), any(), any(), any(), any(), any()))
                .willReturn(apiResponse);

        given(transactionRepository.save(any())).willAnswer(invocation -> invocation.getArgument(0));

        // when
        TransactionResponseDto response = transactionService.approvePayment(request, 2L);

        // then
        assertThat(product.getStatus()).isEqualTo("SOLD");
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("결제 승인 실패 - 계좌 정보 조회 불가")
    void approvePayment_fail_no_account() {
        // given
        User seller = User.builder().id(1L).build();
        User buyer = User.builder().id(2L).build();
        Product product = Product.builder().id(100L).seller(seller).status("TRADING").build();
        
        TransactionRequestDto request = TransactionRequestDto.builder()
                .productId(100L).buyerId(2L).amount(10000L).build();

        given(productRepository.findByIdWithLock(100L)).willReturn(Optional.of(product));
        given(userRepository.findById(2L)).willReturn(Optional.of(buyer));
        given(userAccountRepository.findByUserId(2L)).willReturn(Optional.empty());

        // when & then
        assertThrows(BusinessException.class, () -> 
            transactionService.approvePayment(request, 2L)
        );
    }
}
