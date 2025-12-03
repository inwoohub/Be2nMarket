package com.example.repository;

import com.example.entity.ChatParticipant;
import com.example.entity.embeddable.ChatParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, ChatParticipantId> {

    /**
     * [추가됨] 내(userId)가 참여 중인 채팅방 목록을 조회합니다.
     * JOIN FETCH cp.chatroom: 채팅방 정보(ChatRoom)도 한 번에 가져와서 성능을 최적화합니다(N+1 방지).
     */
    @Query("SELECT cp FROM ChatParticipant cp JOIN FETCH cp.chatroom WHERE cp.user.user_id = :userId")
    List<ChatParticipant> findAllByUserId(@Param("userId") Long userId);
}