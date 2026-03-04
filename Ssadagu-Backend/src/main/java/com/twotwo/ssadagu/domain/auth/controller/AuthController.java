package com.twotwo.ssadagu.domain.auth.controller;

import com.twotwo.ssadagu.domain.auth.dto.LoginRequestDto;
import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.auth.service.AuthService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "토큰 기반 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "이메일과 비밀번호를 이용하여 액세스 토큰과 리프레시 토큰을 발급합니다.")
    @PostMapping("/login")
    public ApiResponse<TokenDto> login(@RequestBody @Valid LoginRequestDto loginRequestDto) {
        TokenDto tokenDto = authService.login(loginRequestDto);
        return ApiResponse.success(tokenDto);
    }

    @Operation(summary = "토큰 재발급", description = "유효한 리프레시 토큰과 기존 액세스 토큰을 통해 새로운 토큰 쌍을 재발급합니다.")
    @PostMapping("/reissue")
    public ApiResponse<TokenDto> reissue(@RequestHeader("Authorization") String accessToken,
            @RequestHeader("Refresh-Token") String refreshToken) {
        // 클라이언트에서 넘겨준 토큰에 'Bearer ' 접두사가 있을 경우 제거
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        TokenDto tokenDto = authService.reissue(accessToken, refreshToken);
        return ApiResponse.success(tokenDto);
    }

    @Operation(summary = "로그아웃", description = "서버에서 사용자의 리프레시 토큰을 삭제하여 로그아웃 처리합니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String accessToken) {
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        authService.logout(accessToken);
        return ApiResponse.success(null);
    }
}
