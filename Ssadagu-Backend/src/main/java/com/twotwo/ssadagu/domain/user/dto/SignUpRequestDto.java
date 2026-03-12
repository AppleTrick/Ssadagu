package com.twotwo.ssadagu.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "회원가입 요청 DTO")
public class SignUpRequestDto {

    @Schema(description = "이메일", example = "ssafy@ssafy.com")
    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @Schema(description = "비밀번호", example = "password123!")
    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    private String password;

    @Schema(description = "닉네임", example = "싸피인")
    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    private String nickname;

    @Schema(description = "지역", example = "서울")
    @NotBlank(message = "지역은 필수 입력값입니다.")
    private String region;
}
