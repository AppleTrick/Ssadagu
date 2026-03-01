package com.twotwo.ssadagu.domain.user.dto;

import com.twotwo.ssadagu.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {
    private Long id;

    public static UserResponseDto from(User entity) {
        return UserResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
