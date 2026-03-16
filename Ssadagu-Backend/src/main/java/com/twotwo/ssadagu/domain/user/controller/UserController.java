package com.twotwo.ssadagu.domain.user.controller;

import com.twotwo.ssadagu.domain.product.dto.ProductResponseDto;
import com.twotwo.ssadagu.domain.product.dto.ProductWishResponseDto;
import com.twotwo.ssadagu.domain.transaction.dto.TransactionResponseDto;
import com.twotwo.ssadagu.domain.user.dto.MyPageResponseDto;
import com.twotwo.ssadagu.domain.user.dto.ProfileUpdateRequestDto;
import com.twotwo.ssadagu.domain.user.dto.SignUpRequestDto;
import com.twotwo.ssadagu.domain.user.dto.UserResponseDto;
import com.twotwo.ssadagu.domain.user.service.UserService;
import com.twotwo.ssadagu.global.response.ApiResponse;
import com.twotwo.ssadagu.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 생성합니다.")
    @PostMapping("/signup")
    public ApiResponse<UserResponseDto> signup(@RequestBody @Valid SignUpRequestDto requestDto) {
        UserResponseDto responseDto = userService.signup(requestDto);
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "동네 인증", description = "1원 인증 완료 후 로그인된 계정에 동네 정보를 인증합니다.")
    @PostMapping("/region-verify")
    public ApiResponse<Void> verifyRegion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid com.twotwo.ssadagu.domain.user.dto.RegionVerifyRequestDto requestDto) {
        userService.verifyRegion(userDetails.getUser().getId(), requestDto);
        return ApiResponse.success(null);
    }

    // ===== 마이페이지 =====

    @Operation(summary = "내 프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 반환합니다.")
    @GetMapping("/me")
    public ApiResponse<MyPageResponseDto> getMyPage(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MyPageResponseDto responseDto = userService.getMyPage(userDetails.getUser().getId());
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "프로필 수정", description = "닉네임을 수정합니다.")
    @PatchMapping("/me")
    public ApiResponse<MyPageResponseDto> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ProfileUpdateRequestDto requestDto) {
        MyPageResponseDto responseDto = userService.updateProfile(userDetails.getUser().getId(), requestDto);
        return ApiResponse.success(responseDto);
    }

    @Operation(summary = "회원 탈퇴", description = "현재 로그인한 사용자를 탈퇴 처리합니다.")
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteUser(userDetails.getUser().getId());
        return ApiResponse.success(null);
    }

    @Operation(summary = "내 판매 내역", description = "내가 등록한 상품 목록을 반환합니다.")
    @GetMapping("/me/products")
    public ApiResponse<List<ProductResponseDto>> getMyProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ProductResponseDto> products = userService.getMyProducts(userDetails.getUser().getId());
        return ApiResponse.success(products);
    }

    @Operation(summary = "내 구매 내역", description = "내가 구매 완료한 거래 목록을 반환합니다.")
    @GetMapping("/me/purchases")
    public ApiResponse<List<TransactionResponseDto>> getMyPurchases(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TransactionResponseDto> purchases = userService.getMyPurchases(userDetails.getUser().getId());
        return ApiResponse.success(purchases);
    }

    @Operation(summary = "내 관심 목록", description = "관심 등록한 상품 목록을 반환합니다.")
    @GetMapping("/me/wishes")
    public ApiResponse<List<ProductWishResponseDto>> getMyWishes(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ProductWishResponseDto> wishes = userService.getMyWishes(userDetails.getUser().getId());
        return ApiResponse.success(wishes);
    }
}
