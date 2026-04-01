package com.twotwo.ssadagu.domain.chat.dto;

import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.entity.ProductImage;
import com.twotwo.ssadagu.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ChatRoomResponseDto {
    private Long roomId;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private Long productPrice;
    private String productStatus;
    private Long partnerId;
    private String partnerNickname;
    private String partnerProfileImageUrl;
    private String lastMessage;
    private LocalDateTime lastSentAt;
    private Integer unreadCount;
    private String myRole;

    public static ChatRoomResponseDto from(ChatRoom chatRoom, Long currentUserId) {
        Product product = chatRoom.getProduct();
        User partner = chatRoom.getBuyer().getId().equals(currentUserId) ? chatRoom.getSeller() : chatRoom.getBuyer();
        
        List<ProductImage> images = product.getImages();
        String imageUrl = (images != null && !images.isEmpty()) ? images.get(0).getImageUrl() : null;

        int unreadCount = chatRoom.getBuyer().getId().equals(currentUserId) 
                ? chatRoom.getUnreadCountBuyer() 
                : chatRoom.getUnreadCountSeller();

        return ChatRoomResponseDto.builder()
                .roomId(chatRoom.getId())
                .productId(product.getId())
                .productTitle(product.getTitle())
                .productImageUrl(imageUrl)
                .productPrice(product.getPrice())
                .productStatus(product.getStatus())
                .partnerId(partner.getId())
                .partnerNickname(partner.getNickname())
                .partnerProfileImageUrl(partner.getProfileImageUrl())
                .lastMessage(chatRoom.getLastMessage())
                .lastSentAt(chatRoom.getLastSentAt())
                .unreadCount(unreadCount)
                .myRole(chatRoom.getBuyer().getId().equals(currentUserId) ? "BUYER" : "SELLER")
                .build();
    }
}
