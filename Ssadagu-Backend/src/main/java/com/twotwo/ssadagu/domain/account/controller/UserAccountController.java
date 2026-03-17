package com.twotwo.ssadagu.domain.account.controller;

import com.twotwo.ssadagu.domain.account.dto.AccountRegisterRequestDto;
import com.twotwo.ssadagu.domain.account.dto.AccountRegisterResponseDto;
import com.twotwo.ssadagu.domain.account.dto.AccountVerifyRequestDto;
import com.twotwo.ssadagu.domain.account.service.UserAccountService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Account Auth", description = "계좌 및 1원 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts")
public class UserAccountController {

    private final UserAccountService userAccountService;

    @Operation(summary = "1원 송금 인증 요청 (Mock)", description = "계좌 정보를 받아 1원 송금을 요청하고 인증 프로세스를 시작합니다.")
    @PostMapping
    public ApiResponse<AccountRegisterResponseDto> registerAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid AccountRegisterRequestDto requestDto) {
        AccountRegisterResponseDto responseDto = userAccountService.registerAccountAndStartAuth(userDetails.getUser(),
                requestDto);
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "1원 송금 인증 확인", description = "발송된 1원 입금자명을 확인하여 인증을 완료합니다.")
    @PostMapping("/{id}/verify/confirm")
    public ApiResponse<Void> verifyAuth(
            @PathVariable("id") Long accountId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid AccountVerifyRequestDto requestDto) {
        userAccountService.verifyAuth(userDetails.getUser(), accountId, requestDto);
        return ApiResponse.success();
    }
}
