package com.example.repository;

import com.example.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    
    // ⭐ [수정됨] status 조건 제거!
    // "나(userId)가 판매자거나 구매자인 모든 거래 기록을 가져와라"
    @Query("SELECT t FROM Trade t " +
           "WHERE (t.seller.user_id = :userId OR t.buyer.user_id = :userId) " +
           "ORDER BY t.created_at DESC")
    List<Trade> findAllCompletedTrades(@Param("userId") Long userId);
}