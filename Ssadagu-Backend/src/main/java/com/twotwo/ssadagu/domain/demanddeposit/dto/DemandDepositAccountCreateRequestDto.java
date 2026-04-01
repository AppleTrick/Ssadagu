package com.twotwo.ssadagu.domain.demanddeposit.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "수시입출금 계좌 생성 요청 DTO")
public class DemandDepositAccountCreateRequestDto {

    @Schema(description = "가입할 수시입출금 상품 고유번호", example = "001-1-7a336b19062347")
    private String accountTypeUniqueNo;
}
