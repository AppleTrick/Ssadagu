package com.twotwo.ssadagu.domain.account.dto;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserAccountResponseDto {
    private Long id;
    private String accountNumber;
    private String bankName;
    private String bankCode;
    private String verifiedStatus;

    public static UserAccountResponseDto from(UserAccount entity) {
        return UserAccountResponseDto.builder()
                .id(entity.getId())
                .accountNumber(entity.getAccountNumber())
                .bankName(entity.getBankName())
                .bankCode(entity.getBankCode())
                .verifiedStatus(entity.getVerifiedStatus())
                .build();
    }
}
