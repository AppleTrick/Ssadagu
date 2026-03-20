package com.twotwo.ssadagu.domain.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "1원 송금 인증 요청 (계좌 등록) DTO")
public class AccountRegisterRequestDto {

    @Schema(description = "은행 코드", example = "004")
    @NotBlank(message = "은행 코드는 필수 입력값입니다.")
    private String bankCode;

    @Schema(description = "은행 명", example = "국민은행")
    private String bankName;

    @Schema(description = "계좌 번호", example = "1234567890")
    @NotBlank(message = "계좌 번호는 필수 입력값입니다.")
    private String accountNumber;

    @Schema(description = "예금주 명", example = "홍길동")
    @NotBlank(message = "예금주 명은 필수 입력값입니다.")
    private String accountHolderName;
}
