package com.twotwo.ssadagu.domain.user.dto;

import com.twotwo.ssadagu.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "마이페이지 응답 DTO")
public class MyPageResponseDto {

    @Schema(description = "사용자 ID", example = "1")
    private Long id;

    @Schema(description = "이메일", example = "user@example.com")
    private String email;

    @Schema(description = "닉네임", example = "행복한 사과_123")
    private String nickname;

    @Schema(description = "인증된 동네", example = "강남구")
    private String region;

    @Schema(description = "계정 상태", example = "ACTIVE")
    private String status;

    @Schema(description = "2차 비밀번호 설정 여부")
    private boolean isSecondaryPasswordSet;

    @Schema(description = "생체 인증 활성화 여부")
    private boolean isBiometricEnabled;

    public static MyPageResponseDto from(User entity) {
        return MyPageResponseDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .nickname(entity.getNickname())
                .region(entity.getRegion())
                .status(entity.getStatus())
                .isSecondaryPasswordSet(entity.getSecondaryPasswordHash() != null)
                .isBiometricEnabled(entity.getIsBiometricEnabled())
                .build();
    }
}
