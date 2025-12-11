package com.example.repository;

import com.example.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // [기존 유지] 유저 간 존재 여부 확인 (사용처가 없다면 삭제해도 무방하나 일단 둠)
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

    /**
     * [추가됨] 특정 게시글(postId)에 대해 특정 유저(userId)가 참여 중인 채팅방을 찾습니다.
     * - ChatParticipant를 통해 해당 유저가 참여 중이고,
     * - 그 채팅방이 해당 Post와 연결되어 있는지 확인합니다.
     */
    @Query("SELECT cp.chatroom FROM ChatParticipant cp " +
            "WHERE cp.user.user_id = :userId " +
            "AND cp.chatroom.post.post_id = :postId")
    Optional<ChatRoom> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);
}