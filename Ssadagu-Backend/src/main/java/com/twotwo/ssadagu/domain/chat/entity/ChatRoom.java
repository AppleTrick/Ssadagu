package com.twotwo.ssadagu.domain.chat.entity;

import com.twotwo.ssadagu.domain.product.entity.Product;
import com.twotwo.ssadagu.domain.user.entity.User;
import com.twotwo.ssadagu.global.entity.BaseCreatedEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoom extends BaseCreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    @Column(name = "unread_count_buyer", nullable = false)
    private Integer unreadCountBuyer;

    @Column(name = "unread_count_seller", nullable = false)
    private Integer unreadCountSeller;

    @Column(name = "room_status", nullable = false, length = 20)
    private String roomStatus;
}
