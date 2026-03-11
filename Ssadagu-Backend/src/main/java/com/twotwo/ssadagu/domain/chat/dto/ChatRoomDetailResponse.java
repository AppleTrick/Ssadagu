package com.twotwo.ssadagu.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDetailResponse {
    private Long roomId;
    private ProductSummary product;
    private UserSummary partner;
    private String lastMessage;
    private LocalDateTime lastSentAt;
    private String roomStatus;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductSummary {
        private Long productId;
        private String title;
        private Long price;
        private String status;
        private String imageUrl;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private Long userId;
        private String nickname;
    }
}
