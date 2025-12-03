package com.example.repository;

import com.example.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /**
     * [추가됨] 두 유저(user1, user2)가 공통으로 참여하고 있는 1:1 채팅방이 있는지 조회합니다.
     * - 서브쿼리를 사용하여 두 유저가 모두 포함된 chatroom_id를 찾습니다.
     * - (당근마켓처럼 게시글(post_id) 단위로 방을 나눈다면 로직이 달라지지만, 현재는 유저 간 1:1 방으로 가정)
     */
    @Query("SELECT r FROM ChatRoom r " +
            "WHERE r.chatroom_id IN (" +
            "    SELECT p1.chatroom.chatroom_id FROM ChatParticipant p1 " +
            "    WHERE p1.user.user_id = :user1Id " +
            "    AND p1.chatroom.chatroom_id IN (" +
            "        SELECT p2.chatroom.chatroom_id FROM ChatParticipant p2 " +
            "        WHERE p2.user.user_id = :user2Id" +
            "    )" +
            ")")
    Optional<ChatRoom> findChatRoomByUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}