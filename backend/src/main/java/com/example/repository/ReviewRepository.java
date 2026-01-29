package com.example.repository;

import com.example.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 1. 전체 후기 (기존 코드)
    @Query("SELECT r FROM Review r JOIN FETCH r.fromUser WHERE r.toUser.user_id = :userId ORDER BY r.created_at DESC")
    List<Review> findReviewsByUserId(@Param("userId") Long userId);

    // 2. ⭐ [추가됨] 판매자 후기 (내가 판매자로서 받은 것)
    // 조건: 거래(trade)의 판매자(seller)가 '나(userId)'인 경우
    @Query("SELECT r FROM Review r JOIN FETCH r.fromUser JOIN r.trade t " +
           "WHERE r.toUser.user_id = :userId AND t.seller.user_id = :userId " +
           "ORDER BY r.created_at DESC")
    List<Review> findSellerReviews(@Param("userId") Long userId);

    // 3. ⭐ [추가됨] 구매자 후기 (내가 구매자로서 받은 것)
    // 조건: 거래(trade)의 구매자(buyer)가 '나(userId)'인 경우
    @Query("SELECT r FROM Review r JOIN FETCH r.fromUser JOIN r.trade t " +
           "WHERE r.toUser.user_id = :userId AND t.buyer.user_id = :userId " +
           "ORDER BY r.created_at DESC")
    List<Review> findBuyerReviews(@Param("userId") Long userId);
}