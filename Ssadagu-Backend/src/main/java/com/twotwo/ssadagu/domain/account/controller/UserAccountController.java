package com.twotwo.ssadagu.domain.account.controller;

import com.twotwo.ssadagu.domain.account.dto.AccountRegisterRequestDto;
import com.twotwo.ssadagu.domain.account.dto.AccountRegisterResponseDto;
import com.twotwo.ssadagu.domain.account.dto.AccountVerifyRequestDto;
import com.twotwo.ssadagu.domain.account.dto.UserAccountResponseDto;
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

    @Operation(summary = "1원 송금 인증 요청", description = "계좌 정보를 받아 실제로 1원 송금을 요청하고 인증 프로세스를 시작합니다.")
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

    @Operation(summary = "내 계좌 정보 조회", description = "특정 유저의 주 계좌 정보를 조회합니다. (본인만 가능)")
    @GetMapping("/users/{userId}")
    public ApiResponse<UserAccountResponseDto> getMyAccount(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        UserAccountResponseDto responseDto = userAccountService.getMyAccount(userId);
        return ApiResponse.success(responseDto);
    }

    private void validateUserAuthority(CustomUserDetails userDetails, Long targetUserId) {
        if (userDetails == null || !userDetails.getUser().getId().equals(targetUserId)) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.ACCESS_DENIED);
        }
    }
}
