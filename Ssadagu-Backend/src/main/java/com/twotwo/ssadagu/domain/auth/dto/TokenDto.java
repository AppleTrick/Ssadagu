package com.twotwo.ssadagu.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "토큰 응답 DTO")
@Getter
@Builder
@AllArgsConstructor
public class TokenDto {

    @Schema(description = "권한 부여 타입 (예: Bearer)", example = "Bearer")
    private String grantType;

    @Schema(description = "액세스 토큰 (API 요청 시 Authorization 헤더에 사용)")
    private String accessToken;

    @JsonIgnore
    @Schema(description = "리프레시 토큰 (액세스 토큰 만료 시 재발급을 위해 사용)")
    private String refreshToken;

    @Schema(description = "사용자 고유 ID", example = "1")
    private Long userId;
}
