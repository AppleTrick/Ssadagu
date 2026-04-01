package com.twotwo.ssadagu.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "동네 인증 요청 DTO")
public class RegionVerifyRequestDto {

    @Schema(description = "동네(지역) 명", example = "강남구")
    @NotBlank(message = "지역명은 필수 입력값입니다.")
    private String region;
}
