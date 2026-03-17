package com.twotwo.ssadagu.domain.chat.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "채팅방 생성 요청 DTO")
public class ChatRoomRequest {
    @Schema(description = "상품 ID", example = "1")
    private Long productId;
}
