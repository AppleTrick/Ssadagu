package com.twotwo.ssadagu.domain.chat.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    private String id;

    @Field("room_id")
    private Long roomId;

    @Field("sender_id")
    private Long senderId;

    @Field("content")
    private String content;

    @Field("message_type")
    private MessageType type;

    @Field("image_url")
    private String imageUrl;

    @Field("latitude")
    private Double latitude;

    @Field("longitude")
    private Double longitude;

    @Field("location_name")
    private String locationName;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum MessageType {
        TALK, ENTER, LEAVE, SYSTEM, PAYMENT_REQUEST, PAYMENT_SUCCESS, PAYMENT_FAIL, IMAGE, MAP
    }
}
