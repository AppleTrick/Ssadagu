package com.twotwo.ssadagu.domain.chat.service;

import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.repository.ChatMessageRepository;
import com.twotwo.ssadagu.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;
    private final org.springframework.messaging.simp.SimpMessageSendingOperations messagingTemplate;

    private static final int DEFAULT_PAGE_SIZE = 30;

    @Transactional
    public ChatMessage saveMessage(ChatMessage incomingMessage) {
        ChatMessage message = ChatMessage.builder()
                .roomId(incomingMessage.getRoomId())
                .senderId(incomingMessage.getSenderId())
                .content(incomingMessage.getContent())
                .type(incomingMessage.getType())
                .imageUrl(incomingMessage.getImageUrl())
                .latitude(incomingMessage.getLatitude())
                .longitude(incomingMessage.getLongitude())
                .locationName(incomingMessage.getLocationName())
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // last_message / unread_count 업데이트
        boolean isBuyer = isSenderBuyer(incomingMessage.getRoomId(), incomingMessage.getSenderId());

        String lastMessageContent = incomingMessage.getContent();
        if (incomingMessage.getType() == ChatMessage.MessageType.IMAGE) {
            lastMessageContent = "(사진)";
        } else if (incomingMessage.getType() == ChatMessage.MessageType.MAP) {
            lastMessageContent = "(지도)";
        } else if (incomingMessage.getType() == ChatMessage.MessageType.PAYMENT_REQUEST) {
            lastMessageContent = "(결제 요청)";
        } else if (incomingMessage.getType() == ChatMessage.MessageType.PAYMENT_SUCCESS) {
            lastMessageContent = "(결제 완료)";
        } else if (incomingMessage.getType() == ChatMessage.MessageType.PAYMENT_FAIL) {
            lastMessageContent = "(결제 취소)";
        }

        chatRoomService.updateLastMessage(incomingMessage.getRoomId(), lastMessageContent, isBuyer);

        // [핵심] 메시지를 해당 방의 구독자 및 관련된 두 명(구매자, 판매자)의 개인 채널로 모두 전송
        try {
            messagingTemplate.convertAndSend("/sub/chat/room/" + savedMessage.getRoomId(), savedMessage);
            
            chatRoomRepository.findById(savedMessage.getRoomId()).ifPresent(room -> {
                Long buyerId = room.getBuyer().getId();
                Long sellerId = room.getSeller().getId();
                
                messagingTemplate.convertAndSend("/sub/chat/user/" + buyerId, savedMessage);
                messagingTemplate.convertAndSend("/sub/chat/user/" + sellerId, savedMessage);
                
                log.info("[WebSocket] Sent to Room: {}, Buyer User: {}, Seller User: {}, Message Type: {}", 
                        savedMessage.getRoomId(), buyerId, sellerId, savedMessage.getType());
            });
        } catch (Exception e) {
            log.error("[WebSocket] Failed to broadcast message", e);
        }

        return savedMessage;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ChatMessage sendSystemMessage(Long roomId, String content, ChatMessage.MessageType type) {
        ChatMessage sysMsg = ChatMessage.builder()
                .roomId(roomId)
                .content(content)
                .type(type)
                .build();
        return saveMessage(sysMsg);
    }

    /** 최신 메시지 N개 조회 (채팅방 최초 진입 시) */
    @Transactional(readOnly = true)
    public List<ChatMessage> getLatestMessages(Long roomId) {
        return chatMessageRepository.findLatestByRoomId(
                roomId, PageRequest.of(0, DEFAULT_PAGE_SIZE));
    }

    /** 커서 기반 이전 메시지 조회 (위로 스크롤 시) */
    @Transactional(readOnly = true)
    public List<ChatMessage> getMessagesByCursor(Long roomId, Long cursorId, int size) {
        return chatMessageRepository.findByRoomIdBeforeCursor(
                roomId, cursorId, PageRequest.of(0, size));
    }

    /** 전체 조회 (하위 호환) */
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(Long roomId) {
        return chatMessageRepository.findAllByRoomIdOrderByCreatedAtAsc(roomId);
    }

    /** 읽음 처리 - 해당 방 전체 메시지 읽음으로 변경 */
    @Transactional
    public int markAsRead(Long roomId) {
        return chatMessageRepository.markAllAsRead(roomId);
    }

    /** 발신자가 구매자인지 판별 (실제 DB 조회) */
    private boolean isSenderBuyer(Long roomId, Long senderId) {
        if (senderId == null) return false;
        return chatRoomRepository.findById(roomId)
                .map(room -> room.getBuyer().getId().equals(senderId))
                .orElse(false);
    }
}
