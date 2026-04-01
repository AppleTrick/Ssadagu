package com.twotwo.ssadagu.domain.chat.service;

import com.twotwo.ssadagu.domain.chat.dto.ChatRoomDetailResponse;
import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import com.twotwo.ssadagu.domain.chat.repository.ChatRoomRepository;
import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.product.repository.ProductRepository;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ChatRoomDetailResponse getChatRoomDetail(Long roomId, Long currentUserId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("ChatRoom not found"));

        Product product = chatRoom.getProduct();
        User partner = chatRoom.getBuyer().getId().equals(currentUserId) ? chatRoom.getSeller() : chatRoom.getBuyer();

        return ChatRoomDetailResponse.builder()
                .roomId(chatRoom.getId())
                .product(ChatRoomDetailResponse.ProductSummary.builder()
                        .productId(product.getId())
                        .title(product.getTitle())
                        .price(product.getPrice())
                        .status(product.getStatus())
                        // .imageUrl(product.getThumbnailUrl()) // Assume thumbnail exists or use first image
                        .build())
                .partner(ChatRoomDetailResponse.UserSummary.builder()
                        .userId(partner.getId())
                        .nickname(partner.getNickname())
                        .profileImageUrl(partner.getProfileImageUrl())
                        .build())
                .lastMessage(chatRoom.getLastMessage())
                .lastSentAt(chatRoom.getLastSentAt())
                .roomStatus(chatRoom.getRoomStatus())
                .build();
    }

    @Transactional
    public ChatRoom createOrGetChatRoom(Long productId, Long buyerId) {
        return chatRoomRepository.findByProductIdAndBuyerId(productId, buyerId)
                .orElseGet(() -> {
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    User buyer = userRepository.findById(buyerId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found"));
                    
                    ChatRoom chatRoom = ChatRoom.builder()
                            .product(product)
                            .buyer(buyer)
                            .seller(product.getSeller())
                            .unreadCountBuyer(0)
                            .unreadCountSeller(0)
                            .roomStatus("ACTIVE")
                            .build();

                    product.increaseChatCount();
                    return chatRoomRepository.save(chatRoom);
                });
    }

    @Transactional
    public void updateLastMessage(Long roomId, String content, boolean isBuyer) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("ChatRoom not found"));
        
        // This is a simplified version, you might want to adjust unread counts logic
        ChatRoom updatedChatRoom = ChatRoom.builder()
                .id(chatRoom.getId())
                .product(chatRoom.getProduct())
                .buyer(chatRoom.getBuyer())
                .seller(chatRoom.getSeller())
                .lastMessage(content)
                .lastSentAt(LocalDateTime.now())
                .unreadCountBuyer(isBuyer ? chatRoom.getUnreadCountBuyer() : chatRoom.getUnreadCountBuyer() + 1)
                .unreadCountSeller(isBuyer ? chatRoom.getUnreadCountSeller() + 1 : chatRoom.getUnreadCountSeller())
                .roomStatus(chatRoom.getRoomStatus())
                .build();
        
        chatRoomRepository.save(updatedChatRoom);
    }
    
    @Transactional
    public void resetUnreadCount(Long roomId, Long currentUserId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("ChatRoom not found"));
        
        boolean isBuyer = chatRoom.getBuyer().getId().equals(currentUserId);
        
        ChatRoom updatedChatRoom = ChatRoom.builder()
                .id(chatRoom.getId())
                .product(chatRoom.getProduct())
                .buyer(chatRoom.getBuyer())
                .seller(chatRoom.getSeller())
                .lastMessage(chatRoom.getLastMessage())
                .lastSentAt(chatRoom.getLastSentAt())
                .unreadCountBuyer(isBuyer ? 0 : chatRoom.getUnreadCountBuyer())
                .unreadCountSeller(!isBuyer ? 0 : chatRoom.getUnreadCountSeller())
                .roomStatus(chatRoom.getRoomStatus())
                .build();
                
        chatRoomRepository.save(updatedChatRoom);
    }
    @Transactional(readOnly = true)
    public java.util.List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto> getChatRoomsByUserId(Long userId) {
        return chatRoomRepository.findByBuyerIdOrSellerIdOrderByLastSentAtDesc(userId, userId).stream()
                .map(chatRoom -> com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto.from(chatRoom, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto> getChatRoomsByProductId(Long productId, Long userId) {
        return chatRoomRepository.findByProductIdOrderByLastSentAtDesc(productId).stream()
                .map(chatRoom -> com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto.from(chatRoom, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public int getChatRoomCountByProductId(Long productId) {
        return chatRoomRepository.countByProductId(productId);
    }
}
