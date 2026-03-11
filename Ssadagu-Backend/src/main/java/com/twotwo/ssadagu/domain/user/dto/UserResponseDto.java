package com.twotwo.ssadagu.domain.user.dto;

import com.twotwo.ssadagu.domain.auth.dto.TokenDto;
import com.twotwo.ssadagu.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {
    private Long id;
    private TokenDto token;

    public static UserResponseDto from(User entity, TokenDto token) {
        return UserResponseDto.builder()
                .id(entity.getId())
                .token(token)
                .build();
    }
}
