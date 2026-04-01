package com.twotwo.ssadagu.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BiometricRegistrationRequestDto {

    @NotBlank(message = "공개키는 필수입니다.")
    private String publicKey;
}
