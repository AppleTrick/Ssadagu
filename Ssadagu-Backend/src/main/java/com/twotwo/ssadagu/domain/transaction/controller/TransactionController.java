package com.twotwo.ssadagu.domain.transaction.controller;

import com.twotwo.ssadagu.domain.transaction.dto.PaymentRequestDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionRequestDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.transaction.service.TransactionService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Transaction", description = "거래 및 결제 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "결제 요청 (판매자)", description = "판매자가 채팅방에서 구매자에게 결제를 요청합니다. 상품 상태가 '거래중'으로 변경됩니다.")
    @PostMapping("/request")
    public ApiResponse<Void> requestPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PaymentRequestDto requestDto) {
        
        transactionService.requestPayment(
                requestDto.getProductId(),
                userDetails.getUser().getId(),
                requestDto.getBuyerId(),
                requestDto.getRoomId()
        );
        return ApiResponse.success(null);
    }

    @Operation(summary = "결제 승인 (구매자)", description = "구매자가 결제를 승인하여 이체를 실행하고 거래를 완료합니다.")
    @PostMapping("/approve")
    public ApiResponse<TransactionResponseDto> approvePayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TransactionRequestDto requestDto) {
        
        TransactionResponseDto response = transactionService.approvePayment(
                requestDto,
                userDetails.getUser().getId()
        );
        return ApiResponse.success(response);
    }

    @Operation(summary = "거래 취소", description = "거래 진행 중(결제 전)인 상품의 거래를 취소하고 상태를 '판매중'으로 되돌립니다.")
    @PostMapping("/cancel")
    public ApiResponse<Void> cancelPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PaymentRequestDto requestDto) {
        
        transactionService.cancelPayment(
                requestDto.getProductId(),
                userDetails.getUser().getId(),
                requestDto.getRoomId()
        );
        return ApiResponse.success(null);
    }

    @Operation(summary = "거래 내역 조회", description = "자신의 구매 또는 판매 내역을 조회합니다. type 파라미터로 구분합니다. (BUY, SELL, ALL)")
    @GetMapping("/history")
    public ApiResponse<org.springframework.data.domain.Page<TransactionResponseDto>> getTransactionHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "type", defaultValue = "ALL") String type,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        
        org.springframework.data.domain.Page<TransactionResponseDto> response = transactionService.getTransactionHistory(
                userDetails.getUser().getId(),
                type,
                pageable
        );
        return ApiResponse.success(response);
    }
}
