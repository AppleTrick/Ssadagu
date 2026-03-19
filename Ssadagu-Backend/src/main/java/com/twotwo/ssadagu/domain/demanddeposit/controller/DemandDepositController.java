package com.twotwo.ssadagu.domain.demanddeposit.controller;

import com.twotwo.ssadagu.domain.demanddeposit.dto.DemandDepositAccountCreateRequestDto;
import com.twotwo.ssadagu.domain.demanddeposit.dto.DemandDepositAccountDepositRequestDto;
import com.twotwo.ssadagu.domain.demanddeposit.service.DemandDepositService;
import com.twotwo.ssadagu.global.dto.SsafyApiResponse;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
    public ApiResponse<SsafyApiResponse<Map<String, Object>>> createAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody DemandDepositAccountCreateRequestDto requestDto) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        SsafyApiResponse<Map<String, Object>> response = demandDepositService.createAccount(
                requestDto.getAccountTypeUniqueNo(), 
                userKey);
        return ApiResponse.success(response);
    }

    @Operation(summary = "수시입출금 계좌 단건 조회", description = "금융망 API를 통해 계좌의 잔액 등 상세 정보를 조회합니다.")
    @GetMapping("/accounts/{accountNo}")
    public ApiResponse<SsafyApiResponse<Map<String, Object>>> getAccount(
            @PathVariable("accountNo") String accountNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        SsafyApiResponse<Map<String, Object>> response = demandDepositService.getAccount(
                accountNo, 
                userKey);
        return ApiResponse.success(response);
    }

    @Operation(summary = "수시입출금 계좌 거래내역 조회", description = "금융망 API를 통해 계좌의 입/출금 거래 내역을 조회합니다.")
    @GetMapping("/accounts/{accountNo}/transactions")
    public ApiResponse<SsafyApiResponse<Map<String, Object>>> getTransactionHistory(
            @Parameter(description = "계좌번호") @PathVariable("accountNo") String accountNo,
            @Parameter(description = "조회 시작일자 (YYYYMMDD)", example = "20230101") @RequestParam(value = "startDate", required = false) String startDate,
            @Parameter(description = "조회 종료일자 (YYYYMMDD)", example = "20231231") @RequestParam(value = "endDate", required = false) String endDate,
            @Parameter(description = "거래구분 (A: 전체, 1: 입금, 2: 출금)", example = "A") @RequestParam(value = "transactionType", required = false) String transactionType,
            @Parameter(description = "정렬순서 (ASC: 오름차순, DESC: 내림차순)", example = "DESC") @RequestParam(value = "orderByType", required = false) String orderByType,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        SsafyApiResponse<Map<String, Object>> response = demandDepositService.getTransactionHistory(
                accountNo, startDate, endDate, transactionType, orderByType, userKey);
        return ApiResponse.success(response);
    }

    @Operation(summary = "수시입출금 계좌 입금 (테스트용)", description = "금융망 API를 통해 계좌에 금액을 입금(테스트 송금)합니다.")
    @PostMapping("/accounts/{accountNo}/deposit")
    public ApiResponse<SsafyApiResponse<Map<String, Object>>> depositAccount(
            @PathVariable("accountNo") String accountNo,
            @RequestBody DemandDepositAccountDepositRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        String userKey = (userDetails != null) ? userDetails.getUser().getUserKey() : null;
        SsafyApiResponse<Map<String, Object>> response = demandDepositService.updateDeposit(
                accountNo,
                requestDto.getAmount(),
                requestDto.getSummary(),
                userKey);
        return ApiResponse.success(response);
    }
}
