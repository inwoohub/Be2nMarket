package com.example.repository;

import com.example.entity.ChatParticipant;
import com.example.entity.User; // [중요] 리턴 타입으로 User를 쓰기 때문에 추가됨
import com.example.entity.embeddable.ChatParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, ChatParticipantId> {

    /**
     * 1. [기존 기능] 내(userId)가 참여 중인 채팅방 목록 조회
     * (채팅 목록 페이지에서 사용 중)
     */
    @Query("SELECT cp FROM ChatParticipant cp JOIN FETCH cp.chatroom WHERE cp.user.user_id = :userId")
    List<ChatParticipant> findAllByUserId(@Param("userId") Long userId);

    /**
     * 2. [신규 추가] 구매자 후보 조회 (거래 완료용)
     * - 해당 게시글(postId)에 연결된 채팅방들을 찾고,
     * - 그 방에 있는 참여자들 중 '판매자(sellerId)'가 아닌 사람(즉, 구매 희망자)의 목록을 가져옵니다.
     * - DISTINCT: 한 사람이 여러 번 채팅을 걸었어도 중복 제거해서 한 명으로 보여줍니다.
     */
    @Query("SELECT DISTINCT cp.user FROM ChatParticipant cp " +
           "JOIN cp.chatroom c " +
           "WHERE c.post.post_id = :postId " +
           "AND cp.user.user_id != :sellerId")
    List<User> findBuyerCandidates(@Param("postId") Long postId, @Param("sellerId") Long sellerId);

}