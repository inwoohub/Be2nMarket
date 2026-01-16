package com.example.service;

import com.example.dto.ReviewReqDto;
import com.example.entity.Review;
import com.example.entity.Trade;
import com.example.entity.User;
import com.example.repository.ReviewRepository;
import com.example.repository.TradeRepository; // TradeRepository가 있다고 가정
import com.example.repository.UserRepository; // UserRepository가 있다고 가정
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TradeRepository tradeRepository;

    @Transactional
    public Long createReview(Long fromUserId, ReviewReqDto dto) {
        
        // 1. 작성자(나) 조회
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException("작성자를 찾을 수 없습니다."));

        // 2. 대상자(상대방) 조회
        User toUser = userRepository.findById(dto.targetUserId())
                .orElseThrow(() -> new IllegalArgumentException("대상자를 찾을 수 없습니다."));

        // 3. 거래 정보 조회
        Trade trade = tradeRepository.findById(dto.tradeId())
                .orElseThrow(() -> new IllegalArgumentException("거래 정보를 찾을 수 없습니다."));

        // 4. 키워드 리스트([1,2]) -> 문자열("1,2") 변환
        String keywordsStr = null;
        if (dto.keywords() != null && !dto.keywords().isEmpty()) {
            keywordsStr = dto.keywords().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }

        // 5. 리뷰 엔티티 생성 및 저장
        Review review = Review.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .trade(trade)
                .rating(dto.rating())
                .comment(dto.content())
                .selectedKeywords(keywordsStr) // 변환된 문자열 저장
                .build();

        Review savedReview = reviewRepository.save(review);
        
        // (선택사항) 여기서 toUser의 매너온도를 업데이트하는 로직을 호출할 수도 있습니다.
        
        return savedReview.getReview_id();
    }
}