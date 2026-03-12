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

    // 프론트엔드에서 테스트용으로 userKey를 별도로 보낼 수 있도록 허용
    @Schema(description = "테스트용 SSAFY User Key", example = "2695628f-11a1-418e-b533-9ae19e0650ec")
    private String testUserKey;
}
