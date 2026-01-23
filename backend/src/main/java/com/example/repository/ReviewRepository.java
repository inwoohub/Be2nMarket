package com.example.repository;

import com.example.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 필요하면 여기에 쿼리 메서드 추가 (예: 특정 유저가 받은 리뷰 조회)
}