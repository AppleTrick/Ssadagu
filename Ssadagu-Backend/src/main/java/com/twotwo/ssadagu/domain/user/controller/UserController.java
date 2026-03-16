package com.twotwo.ssadagu.domain.user.controller;

import com.twotwo.ssadagu.domain.user.dto.SignUpRequestDto;
import com.twotwo.ssadagu.domain.user.dto.UserResponseDto;
import com.twotwo.ssadagu.domain.user.service.UserService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 생성합니다.")
    @PostMapping("/signup")
    public ApiResponse<UserResponseDto> signup(@RequestBody @Valid SignUpRequestDto requestDto, HttpServletResponse response) {
        UserResponseDto responseDto = userService.signup(requestDto);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", responseDto.getToken().getRefreshToken())
                .httpOnly(true)
                .secure(false) // 로컬 테스트를 위해 false 설정. 운영 환경일 경우 true 고려
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7일 유지
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "동네 인증", description = "1원 인증 완료 후 로그인된 계정에 동네 정보를 인증합니다.")
    @PostMapping("/region-verify")
    public ApiResponse<Void> verifyRegion(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.twotwo.ssadagu.global.security.CustomUserDetails userDetails,
            @RequestBody @Valid com.twotwo.ssadagu.domain.user.dto.RegionVerifyRequestDto requestDto) {
        userService.verifyRegion(userDetails.getUser().getId(), requestDto);
        return ApiResponse.success(null);
    }
}
