package com.twotwo.ssadagu.domain.user.controller;

import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductWishResponseDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.user.dto.*;
import com.twotwo.ssadagu.domain.user.service.UserService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
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
    @PostMapping("/{userId}/region-verify")
    public ApiResponse<Void> verifyRegion(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid com.twotwo.ssadagu.domain.user.dto.RegionVerifyRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        userService.verifyRegion(userId, requestDto);
        return ApiResponse.success(null);
    }

    // ===== 마이페이지 =====

    @Operation(summary = "내 프로필 조회", description = "특정 사용자의 프로필 정보를 반환합니다. (본인만 가능)")
    @GetMapping("/{userId}")
    public ApiResponse<MyPageResponseDto> getMyPage(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        MyPageResponseDto responseDto = userService.getMyPage(userId);
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "프로필 수정", description = "닉네임을 수정합니다. (본인만 가능)")
    @PatchMapping("/{userId}")
    public ApiResponse<MyPageResponseDto> updateProfile(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ProfileUpdateRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        MyPageResponseDto responseDto = userService.updateProfile(userId, requestDto);
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "회원 탈퇴", description = "사용자를 탈퇴 처리합니다. (본인만 가능)")
    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        userService.deleteUser(userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "내 판매 내역", description = "사용자가 등록한 상품 목록을 반환합니다. (본인만 가능)")
    @GetMapping("/{userId}/products")
    public ApiResponse<List<ProductResponseDto>> getMyProducts(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        List<ProductResponseDto> products = userService.getMyProducts(userId);
        return ApiResponse.success(products);
    }

    @Operation(summary = "내 구매 내역", description = "사용자가 구매 완료한 거래 목록을 반환합니다. (본인만 가능)")
    @GetMapping({"{userId}/purchases", "{userId}/transactions"})
    public ApiResponse<List<TransactionResponseDto>> getMyPurchases(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        List<TransactionResponseDto> purchases = userService.getMyPurchases(userId);
        return ApiResponse.success(purchases);
    }

    @Operation(summary = "내 관심 목록", description = "사용자가 관심 등록한 상품 목록을 반환합니다. (본인만 가능)")
    @GetMapping("/{userId}/wishes")
    public ApiResponse<List<ProductWishResponseDto>> getMyWishes(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateUserAuthority(userDetails, userId);
        List<ProductWishResponseDto> wishes = userService.getMyWishes(userId);
        return ApiResponse.success(wishes);
    }

    @Operation(summary = "2차 비밀번호 설정/변경")
    @PostMapping("/{userId}/secondary-password")
    public ApiResponse<Void> updateSecondaryPassword(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid SecondaryPasswordRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        userService.updateSecondaryPassword(userId, requestDto);
        return ApiResponse.success(null);
    }

    @Operation(summary = "2차 비밀번호 검증")
    @PostMapping("/{userId}/secondary-password/verify")
    public ApiResponse<Void> verifySecondaryPassword(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid SecondaryPasswordRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        userService.verifySecondaryPassword(userId, requestDto);
        return ApiResponse.success(null);
    }

    @Operation(summary = "생체 인증 등록")
    @PostMapping("/{userId}/biometric/register")
    public ApiResponse<Void> registerBiometric(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid BiometricRegistrationRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        userService.registerBiometric(userId, requestDto);
        return ApiResponse.success(null);
    }

    @Operation(summary = "생체 인증 활성화 여부 변경")
    @PatchMapping("/{userId}/biometric/toggle")
    public ApiResponse<Void> toggleBiometric(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid BiometricToggleRequestDto requestDto) {
        validateUserAuthority(userDetails, userId);
        userService.toggleBiometric(userId, requestDto);
        return ApiResponse.success(null);
    }

    private void validateUserAuthority(CustomUserDetails userDetails, Long targetUserId) {
        if (userDetails == null || !userDetails.getUser().getId().equals(targetUserId)) {
            throw new com.twotwo.ssadagu.global.error.BusinessException(com.twotwo.ssadagu.global.error.ErrorCode.ACCESS_DENIED);
        }
    }
}
