package com.twotwo.ssadagu.domain.chat.dto;

import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatRoomResponseDto {
    private Long id;

    public static ChatRoomResponseDto from(ChatRoom entity) {
        return ChatRoomResponseDto.builder()
                .id(entity.getId())
                .build();
    }
}
