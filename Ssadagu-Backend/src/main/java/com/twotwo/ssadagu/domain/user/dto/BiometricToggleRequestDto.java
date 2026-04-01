package com.twotwo.ssadagu.domain.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BiometricToggleRequestDto {

    @NotNull(message = "생체 인증 활성화 여부는 필수입니다.")
    private Boolean enabled;
}
