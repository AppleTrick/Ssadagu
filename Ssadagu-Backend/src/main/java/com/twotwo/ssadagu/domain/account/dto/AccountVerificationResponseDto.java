package com.twotwo.ssadagu.domain.account.dto;

import com.twotwo.ssadagu.domain.account.entity.AccountVerification;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AccountVerificationResponseDto {
    private Long id;

    public static AccountVerificationResponseDto from(AccountVerification entity) {
        return AccountVerificationResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
