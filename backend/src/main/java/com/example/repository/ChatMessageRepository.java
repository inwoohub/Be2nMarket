package com.example.repository;

import com.example.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // [기존 유지] 채팅방 내부 대화 내역 조회 (과거순)
    @Query("SELECT m FROM ChatMessage m WHERE m.chatroom.chatroom_id = :chatroomId ORDER BY m.created_at ASC")
    List<ChatMessage> findByChatroom_ChatroomIdOrderByCreatedAtAsc(@Param("chatroomId") Long chatroomId);

    /**
     * [수정됨] 최신 메시지 조회
     * - 복잡한 명명 규칙 대신 명시적인 @Query를 사용합니다.
     * - 해당 채팅방의 메시지를 최신순(DESC)으로 정렬하여 리스트로 가져옵니다.
     * - 서비스 계층에서 리스트의 0번째(가장 최신) 요소를 사용합니다.
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.chatroom.chatroom_id = :chatroomId ORDER BY m.created_at DESC")
    List<ChatMessage> findLatestMessages(@Param("chatroomId") Long chatroomId);
}