package com.twotwo.ssadagu.domain.chat.controller;

import com.twotwo.ssadagu.domain.chat.dto.ChatRoomDetailResponse;
import com.twotwo.ssadagu.domain.chat.dto.ChatRoomRequest;
import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import com.twotwo.ssadagu.domain.chat.service.ChatMessageService;
import com.twotwo.ssadagu.domain.chat.service.ChatRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "ChatRoom", description = "채팅방 관리 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Operation(summary = "채팅방 생성 또는 조회", description = "상품과 구매자 정보를 기반으로 채팅방을 생성하거나 이미 존재하면 반환합니다.")
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(request.getProductId(), request.getBuyerId());
        return ResponseEntity.ok(chatRoom);
    }

    @Operation(summary = "채팅방 상세 조회", description = "특정 채팅방의 상세 정보를 조회합니다.")
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDetailResponse> getRoomDetail(@PathVariable Long roomId, @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomDetail(roomId, userId));
    }

    @Operation(summary = "채팅 내역 조회", description = "특정 채팅방의 메시지 내역을 조회합니다.")
    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> getChatHistory(@PathVariable Long roomId) {
        return chatMessageService.getChatHistory(roomId);
    }
}
