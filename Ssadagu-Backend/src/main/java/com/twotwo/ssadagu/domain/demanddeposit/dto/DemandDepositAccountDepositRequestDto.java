package com.twotwo.ssadagu.domain.demanddeposit.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Schema(description = "수시입출금 계좌 입금(테스트용) 요청 DTO")
public class DemandDepositAccountDepositRequestDto {

    @Schema(description = "입금 금액", example = "100000")
    private Long amount;

    @Schema(description = "입금 계좌 요약 (적요명)", example = "테스트 입금")
    private String summary;

}
