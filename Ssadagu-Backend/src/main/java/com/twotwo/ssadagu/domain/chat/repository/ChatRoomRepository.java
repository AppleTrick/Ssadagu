package com.twotwo.ssadagu.domain.chat.repository;

import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByProductIdAndBuyerId(Long productId, Long buyerId);
}
