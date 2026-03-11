package com.twotwo.ssadagu.domain.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "1원 송금 인증 요청 결과 DTO")
public class AccountRegisterResponseDto {

    @Schema(description = "생성 및 인증 요청된 계좌 ID", example = "1")
    private Long id;
}
