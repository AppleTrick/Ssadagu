package com.twotwo.ssadagu.domain.chat.repository;

import com.twotwo.ssadagu.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 기존 - 전체 조회 (최초 입장 시 최신 N개)
    List<ChatMessage> findAllByRoomIdOrderByCreatedAtAsc(Long roomId);

    // 커서 기반 페이지네이션 - idCursor보다 작은 메시지 (과거 메시지 로드)
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId AND m.id < :cursorId ORDER BY m.id DESC")
    List<ChatMessage> findByRoomIdBeforeCursor(
            @Param("roomId") Long roomId,
            @Param("cursorId") Long cursorId,
            Pageable pageable
    );

    // 최초 입장 시 최신 N개 (DESC로 가져온 뒤 프론트에서 reverse)
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId ORDER BY m.id DESC")
    List<ChatMessage> findLatestByRoomId(@Param("roomId") Long roomId, Pageable pageable);

    // 읽음 처리 - 해당 방의 내가 받은 메시지 전부 읽음 처리
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.roomId = :roomId AND m.isRead = false")
    int markAllAsRead(@Param("roomId") Long roomId);
}
