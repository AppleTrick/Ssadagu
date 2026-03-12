package com.twotwo.ssadagu.domain.demanddeposit.controller;

import com.twotwo.ssadagu.domain.demanddeposit.dto.DemandDepositAccountCreateRequestDto;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Demand Deposit", description = "수시입출금 계좌 관리 API (금융망 연동)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/demand-deposits")
public class DemandDepositController {

    private final DemandDepositService demandDepositService;

    @Operation(summary = "수시입출금 계좌 생성", description = "금융망 API를 통해 수시입출금 상품에 가입하고 계좌를 생성합니다.")
    @PostMapping("/accounts")
    public ApiResponse<Map<String, Object>> createAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody DemandDepositAccountCreateRequestDto requestDto) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        Map<String, Object> response = demandDepositService.createAccount(
                requestDto.getAccountTypeUniqueNo(), 
                userKey);
        return ApiResponse.success(response);
    }

    @Operation(summary = "수시입출금 계좌 단건 조회", description = "금융망 API를 통해 계좌의 잔액 등 상세 정보를 조회합니다.")
    @GetMapping("/accounts/{accountNo}")
    public ApiResponse<Map<String, Object>> getAccount(
            @PathVariable("accountNo") String accountNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        Map<String, Object> response = demandDepositService.getAccount(
                accountNo, 
                userKey);
        return ApiResponse.success(response);
    }

    @Operation(summary = "수시입출금 계좌 거래내역 조회", description = "금융망 API를 통해 계좌의 입/출금 거래 내역을 조회합니다.")
    @GetMapping("/accounts/{accountNo}/transactions")
    public ApiResponse<Map<String, Object>> getTransactionHistory(
            @PathVariable("accountNo") String accountNo,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "transactionType", required = false) String transactionType,
            @RequestParam(value = "orderByType", required = false) String orderByType,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        Map<String, Object> response = demandDepositService.getTransactionHistory(
                accountNo, startDate, endDate, transactionType, orderByType, userKey);
        return ApiResponse.success(response);
    }
}
