package com.twotwo.ssadagu.domain.chat.controller;

import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import com.twotwo.ssadagu.domain.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/message")
    public void message(ChatMessage message) {
        // 메시지 저장 및 실시간 전송 (ChatMessageService 내부에 통합됨)
        chatMessageService.saveMessage(message);
    }
}
