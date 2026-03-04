package com.twotwo.ssadagu.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "로그인 요청 DTO")
@Getter
@NoArgsConstructor
public class LoginRequestDto {

    @Schema(description = "사용자 이메일", example = "test@example.com")
    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    @Schema(description = "비밀번호", example = "password123")
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
