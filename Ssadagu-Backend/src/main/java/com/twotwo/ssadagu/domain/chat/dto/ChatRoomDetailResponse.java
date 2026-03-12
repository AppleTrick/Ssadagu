package com.twotwo.ssadagu.domain.chat.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "채팅방 상세 응답 DTO")
public class ChatRoomDetailResponse {
    @Schema(description = "채팅방 ID", example = "1")
    private Long roomId;
    @Schema(description = "상품 요약 정보")
    private ProductSummary product;
    @Schema(description = "대화 상대방 요약 정보")
    private UserSummary partner;
    @Schema(description = "마지막 메시지 내용", example = "안녕하세요, 상품 아직 있나요?")
    private String lastMessage;
    @Schema(description = "마지막 메시지 전송 시간")
    private LocalDateTime lastSentAt;
    @Schema(description = "채팅방 상태", example = "ACTIVE")
    private String roomStatus;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "채팅방 상품 요약 정보")
    public static class ProductSummary {
        @Schema(description = "상품 ID", example = "1")
        private Long productId;
        @Schema(description = "상품 제목", example = "맥북 프로 팝니다")
        private String title;
        @Schema(description = "상품 가격", example = "1500000")
        private Long price;
        @Schema(description = "상품 판매 상태", example = "ON_SALE")
        private String status;
        @Schema(description = "상품 대표 이미지 URL", example = "https://example.com/image.jpg")
        private String imageUrl;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "대화 상대방 요약 정보")
    public static class UserSummary {
        @Schema(description = "사용자 ID", example = "2")
        private Long userId;
        @Schema(description = "사용자 닉네임", example = "구매자1")
        private String nickname;
    }
}
