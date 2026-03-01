package com.twotwo.ssadagu.domain.account.dto;

import com.twotwo.ssadagu.domain.account.entity.UserAccount;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserAccountResponseDto {
    private Long id;

    public static UserAccountResponseDto from(UserAccount entity) {
        return UserAccountResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
