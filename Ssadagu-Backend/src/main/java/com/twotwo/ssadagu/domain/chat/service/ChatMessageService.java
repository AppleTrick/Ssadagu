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

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;

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
            lastMessageContent = "(결제 실패)";
        }

        chatRoomService.updateLastMessage(incomingMessage.getRoomId(), lastMessageContent, isBuyer);

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
