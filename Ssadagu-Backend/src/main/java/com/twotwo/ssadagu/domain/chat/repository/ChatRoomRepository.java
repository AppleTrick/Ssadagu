package com.twotwo.ssadagu.domain.chat.repository;

import com.twotwo.ssadagu.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByProductIdAndBuyerId(Long productId, Long buyerId);
    
    @EntityGraph(attributePaths = {"product", "buyer", "seller"})
    List<ChatRoom> findByBuyerIdOrSellerIdOrderByLastSentAtDesc(Long buyerId, Long sellerId);
    
    @EntityGraph(attributePaths = {"product", "buyer", "seller"})
    List<ChatRoom> findByProductIdOrderByLastSentAtDesc(Long productId);
    
    int countByProductId(Long productId);

    @Query("SELECT cr.product.id, COUNT(cr) FROM ChatRoom cr WHERE cr.product.id IN :productIds GROUP BY cr.product.id")
    List<Object[]> countByProductIds(@Param("productIds") List<Long> productIds);
}
