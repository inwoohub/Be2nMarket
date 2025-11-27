package com.example.repository;

import com.example.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * [수정됨]
     * 변수명이 스네이크 표기법(chatroom_id, created_at)이라서
     * 자동 생성 메서드 이름이 꼬였습니다.
     * * 그래서 @Query를 사용해 직접 JPQL 쿼리를 작성했습니다.
     * "ChatMessage(m)에서 방 번호가 일치하는 것을 찾아 created_at 순서대로 정렬해라" 라는 뜻입니다.
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.chatroom.chatroom_id = :chatroomId ORDER BY m.created_at ASC")
    List<ChatMessage> findByChatroom_ChatroomIdOrderByCreatedAtAsc(@Param("chatroomId") Long chatroomId);

}