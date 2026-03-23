package com.twotwo.ssadagu.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BiometricVerifyRequestDto {

    @NotBlank(message = "디바이스 토큰은 필수입니다.")
    private String publicKey;
}
