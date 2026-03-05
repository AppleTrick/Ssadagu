package com.twotwo.ssadagu.domain.chat.controller;

import com.twotwo.ssadagu.domain.chat.dto.ChatRoomDetailResponse;
import com.twotwo.ssadagu.domain.chat.dto.ChatRoomRequest;
import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import com.twotwo.ssadagu.domain.chat.service.ChatMessageService;
import com.twotwo.ssadagu.domain.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(request.getProductId(), request.getBuyerId());
        return ResponseEntity.ok(chatRoom);
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDetailResponse> getRoomDetail(@PathVariable Long roomId, @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomDetail(roomId, userId));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public Flux<ChatMessage> getChatHistory(@PathVariable Long roomId) {
        return chatMessageService.getChatHistory(roomId);
    }
}
