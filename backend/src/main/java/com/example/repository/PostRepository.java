package com.example.repository;

import com.example.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 1. 메인 페이지 게시글 목록 조회
     * - 삭제되지 않은(deleted_at IS NULL) 게시글만 조회합니다.
     * - 최신순(created_at DESC)으로 정렬합니다.
     */
    @Query("SELECT p FROM Post p WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC")
    List<Post> findAllDesc();

    /**
     * 2. 게시글 상세 조회
     * - 특정 게시글(postId)을 조회합니다.
     * - 삭제된 게시글은 조회되지 않도록 조건(deleted_at IS NULL)을 추가합니다.
     */
    @Query("SELECT p FROM Post p WHERE p.post_id = :postId AND p.deleted_at IS NULL")
    Optional<Post> findActivePostById(@Param("postId") Long postId);

    /**
     * ⭐ [추가됨] 3. 특정 판매자의 게시글 목록 조회
     * - 판매 내역 페이지용
     * - 판매자 ID(seller.user_id)가 일치하고, 삭제되지 않은 글을 최신순으로 조회
     */
    @Query("SELECT p FROM Post p WHERE p.seller.user_id = :sellerId AND p.deleted_at IS NULL ORDER BY p.created_at DESC")
    List<Post> findAllBySellerId(@Param("sellerId") Long sellerId);
}