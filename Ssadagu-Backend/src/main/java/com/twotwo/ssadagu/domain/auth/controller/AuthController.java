package com.twotwo.ssadagu.domain.auth.controller;

import com.twotwo.ssadagu.domain.auth.dto.LoginRequestDto;
import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.auth.service.AuthService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "토큰 기반 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "이메일과 비밀번호를 이용하여 액세스 토큰과 리프레시 토큰을 발급합니다.")
    @PostMapping("/login")
    public ApiResponse<TokenDto> login(@RequestBody @Valid LoginRequestDto loginRequestDto, HttpServletResponse response) {
        TokenDto tokenDto = authService.login(loginRequestDto);
        setRefreshTokenCookie(response, tokenDto.getRefreshToken());
        return ApiResponse.success(tokenDto);
    }

    @Operation(summary = "토큰 재발급", description = "유효한 리프레시 토큰을 통해 새로운 토큰 쌍을 재발급합니다.")
    @PostMapping("/reissue")
    public ApiResponse<TokenDto> reissue(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null) {
            throw new RuntimeException("리프레시 토큰이 없습니다.");
        }

        TokenDto tokenDto = authService.reissue(refreshToken);
        setRefreshTokenCookie(response, tokenDto.getRefreshToken());
        return ApiResponse.success(tokenDto);
    }

    @Operation(summary = "로그아웃", description = "서버에서 사용자의 리프레시 토큰을 삭제하여 로그아웃 처리합니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String accessToken, HttpServletResponse response) {
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        authService.logout(accessToken);
        
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .maxAge(0)
                .path("/")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ApiResponse.success(null);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false) // 로컬 테스트를 위해 false 설정. 운영 환경일 경우 true 고려
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7일 유지
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
