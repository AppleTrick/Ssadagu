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
import java.util.Map;

@Tag(name = "ChatRoom", description = "채팅방 관리 API")
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Operation(summary = "채팅방 생성 또는 조회")
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(request.getProductId(), request.getBuyerId());
        return ResponseEntity.ok(chatRoom);
    }

    @Operation(summary = "채팅방 상세 조회")
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDetailResponse> getRoomDetail(
            @PathVariable Long roomId, @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomDetail(roomId, userId));
    }

    @Operation(summary = "채팅 내역 조회 (커서 기반 페이지네이션)",
            description = "cursor 없으면 최신 30개, cursor(messageId) 있으면 해당 id 이전 메시지를 size개 반환")
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long roomId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "30") int size) {
        List<ChatMessage> messages = cursor == null
                ? chatMessageService.getLatestMessages(roomId)
                : chatMessageService.getMessagesByCursor(roomId, cursor, size);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "읽음 처리", description = "해당 채팅방의 모든 메시지를 읽음 처리합니다.")
    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long roomId) {
        int count = chatMessageService.markAsRead(roomId);
        return ResponseEntity.ok(Map.of("updated", count));
    }

    @Operation(summary = "내 채팅방 목록 조회")
    @GetMapping("/rooms/user")
    public ResponseEntity<List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto>> getChatRoomsByUser(
            @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomsByUserId(userId));
    }

    @Operation(summary = "상품별 채팅방 목록 조회")
    @GetMapping("/products/{productId}/rooms")
    public ResponseEntity<List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto>> getChatRoomsByProduct(
            @PathVariable Long productId, @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomsByProductId(productId, userId));
    }

    @Operation(summary = "상품별 채팅방 개수 조회")
    @GetMapping("/products/{productId}/rooms/count")
    public ResponseEntity<Integer> getChatRoomCountByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomCountByProductId(productId));
    }
}
