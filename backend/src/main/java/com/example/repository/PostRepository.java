package com.example.repository;

import com.example.entity.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 1. 메인 페이지 게시글 목록 조회
     * - @EntityGraph로 연관 엔티티를 한 번에 로딩하여 N+1 문제 방지
     */
    @EntityGraph(attributePaths = {"images", "location", "seller", "category"})
    @Query("SELECT p FROM Post p WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC")
    List<Post> findAllDesc();

    /**
     * 2. 게시글 상세 조회
     * - JOIN FETCH로 연관 엔티티를 한 번에 로딩
     */
    @Query("SELECT p FROM Post p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.location " +
           "LEFT JOIN FETCH p.seller " +
           "LEFT JOIN FETCH p.category " +
           "WHERE p.post_id = :postId AND p.deleted_at IS NULL")
    Optional<Post> findActivePostById(@Param("postId") Long postId);
}
