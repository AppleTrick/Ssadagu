package com.twotwo.ssadagu.domain.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "1원 인증 번호 검증 요청 DTO")
public class AccountVerifyRequestDto {

    @Schema(description = "인증 번호(입금자명)", example = "1234")
    @NotBlank(message = "인증 번호는 필수 입력값입니다.")
    private String code;
}
