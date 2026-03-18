package com.twotwo.ssadagu.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SecondaryPasswordRequestDto {

    @NotBlank(message = "2차 비밀번호는 필수입니다.")
    @Pattern(regexp = "^\\d{6}$", message = "2차 비밀번호는 6자리 숫자여야 합니다.")
    private String secondaryPassword;
}
