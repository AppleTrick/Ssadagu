package com.twotwo.ssadagu.domain.user.dto;

import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {
    private Long id;
    private String region;
    private String userKey;
    private String accountNo;
    private TokenDto token;

    public static UserResponseDto from(User entity, TokenDto token, String accountNo) {
        return UserResponseDto.builder()
                .id(entity.getId())
                .region(entity.getRegion())
                .userKey(entity.getUserKey())
                .accountNo(accountNo)
                .token(token)
                .build();
    }
}
