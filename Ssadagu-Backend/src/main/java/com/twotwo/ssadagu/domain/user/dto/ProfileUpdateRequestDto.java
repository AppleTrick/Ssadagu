package com.twotwo.ssadagu.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "프로필 수정 요청 DTO")
public class ProfileUpdateRequestDto {

    @Schema(description = "변경할 닉네임", example = "새로운닉네임")
    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 2, max = 20, message = "닉네임은 2~20자 이내여야 합니다.")
    private String nickname;
}
