package com.twotwo.ssadagu.domain.chat.service;

import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;

    public Mono<ChatMessage> saveMessage(Long roomId, Long senderId, String content, ChatMessage.MessageType type) {
        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderId(senderId)
                .content(content)
                .type(type)
                .createdAt(LocalDateTime.now())
                .build();

        return chatMessageRepository.save(message)
                .doOnSuccess(saved -> {
                    // Update ChatRoom's last message
                    boolean isBuyer = (senderId != null) && isSenderBuyer(roomId, senderId);
                    chatRoomService.updateLastMessage(roomId, content, isBuyer);
                });
    }

    public Mono<ChatMessage> sendSystemMessage(Long roomId, String content, ChatMessage.MessageType type) {
        return saveMessage(roomId, null, content, type);
    }

    public Flux<ChatMessage> getChatHistory(Long roomId) {
        return chatMessageRepository.findAllByRoomIdOrderByCreatedAtAsc(roomId);
    }

    private boolean isSenderBuyer(Long roomId, Long senderId) {
        // This is a bit inefficient as it hits DB again, but for skeleton it works.
        // You might want to pass this info from the controller/STOMP header.
        return true; // Temporary
    }
}
