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

    @Operation(summary = "채팅방 생성 또는 조회", description = "상품 ID와 구매자 ID를 통해 채팅방을 생성합니다. 이미 존재하면 기존 방을 반환합니다.")
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(
            @RequestBody ChatRoomRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.twotwo.ssadagu.global.security.CustomUserDetails userDetails) {
        ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(request.getProductId(), userDetails.getUser().getId());
        return ResponseEntity.ok(chatRoom);
    }

    @Operation(summary = "채팅방 상세 조회", description = "채팅방 정보 및 상품 정보, 대화 상대방 정보를 반환합니다.")
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
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long roomId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.twotwo.ssadagu.global.security.CustomUserDetails userDetails) {
        int count = chatMessageService.markAsRead(roomId);
        if (userDetails != null && userDetails.getUser() != null) {
            chatRoomService.resetUnreadCount(roomId, userDetails.getUser().getId());
        }
        return ResponseEntity.ok(Map.of("updated", count));
    }

    @Operation(summary = "내 채팅방 목록 조회", description = "내가 참여 중인 모든 채팅방 목록을 최신 메시지 순으로 조회합니다.")
    @GetMapping("/rooms/user")
    public ResponseEntity<List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto>> getChatRoomsByUser(
            @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomsByUserId(userId));
    }

    @Operation(summary = "상품별 채팅방 목록 조회", description = "특정 상품에 대해 내가 판매자로서 참여 중인 채팅방 목록을 조회합니다.")
    @GetMapping("/products/{productId}/rooms")
    public ResponseEntity<List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto>> getChatRoomsByProduct(
            @PathVariable Long productId, @RequestParam Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomsByProductId(productId, userId));
    }

    @Operation(summary = "상품별 채팅방 개수 조회", description = "특정 상품에 생성된 모든 채팅방 개수를 반환합니다.")
    @GetMapping("/products/{productId}/rooms/count")
    public ResponseEntity<Integer> getChatRoomCountByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomCountByProductId(productId));
    }

    @Operation(hidden = true, summary = "채팅방 테스트 조회용")
    @GetMapping("/test/{userId}")
    public ResponseEntity<List<com.twotwo.ssadagu.domain.chat.dto.ChatRoomResponseDto>> testMyChats(@PathVariable Long userId) {
        return ResponseEntity.ok(chatRoomService.getChatRoomsByUserId(userId));
    }
}
