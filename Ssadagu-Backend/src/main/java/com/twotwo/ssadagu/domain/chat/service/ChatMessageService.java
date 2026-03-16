package com.twotwo.ssadagu.domain.chat.service;

import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;

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
        
        // Update ChatRoom's last message
        boolean isBuyer = (incomingMessage.getSenderId() != null) && isSenderBuyer(incomingMessage.getRoomId(), incomingMessage.getSenderId());
        
        // For image/map messages, we might want to display a different last message text
        String lastMessageContent = incomingMessage.getContent();
        if (incomingMessage.getType() == ChatMessage.MessageType.IMAGE) {
            lastMessageContent = "(사진)";
        } else if (incomingMessage.getType() == ChatMessage.MessageType.MAP) {
            lastMessageContent = "(지도)";
        }
        
        chatRoomService.updateLastMessage(incomingMessage.getRoomId(), lastMessageContent, isBuyer);
        
        return savedMessage;
    }

    public ChatMessage sendSystemMessage(Long roomId, String content, ChatMessage.MessageType type) {
        ChatMessage sysMsg = ChatMessage.builder()
                .roomId(roomId)
                .content(content)
                .type(type)
                .build();
        return saveMessage(sysMsg);
    }

    public List<ChatMessage> getChatHistory(Long roomId) {
        return chatMessageRepository.findAllByRoomIdOrderByCreatedAtAsc(roomId);
    }

    private boolean isSenderBuyer(Long roomId, Long senderId) {
        // This is a bit inefficient as it hits DB again, but for skeleton it works.
        // You might want to pass this info from the controller/STOMP header.
        return true; // Temporary
    }
}
