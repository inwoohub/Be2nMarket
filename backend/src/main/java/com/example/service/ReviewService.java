package com.example.service;

import com.example.dto.ReviewReqDto;
import com.example.dto.ReviewResDto;
import com.example.entity.Review;
import com.example.entity.Trade;
import com.example.entity.User;
import com.example.repository.ReviewRepository;
import com.example.repository.TradeRepository;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TradeRepository tradeRepository;

    // 1. 리뷰 작성 (retransaction 저장 로직 추가 필요)
    @Transactional
    public Long createReview(Long fromUserId, ReviewReqDto dto) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 찾을 수 없음"));
        User toUser = userRepository.findById(dto.targetUserId())
                .orElseThrow(() -> new IllegalArgumentException("대상자 찾을 수 없음"));
        Trade trade = tradeRepository.findById(dto.tradeId())
                .orElseThrow(() -> new IllegalArgumentException("거래 정보 찾을 수 없음"));

        String keywordsStr = (dto.keywords() != null) ? 
                dto.keywords().stream().map(String::valueOf).collect(Collectors.joining(",")) : null;

        Review review = Review.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .trade(trade)
                .rating(dto.rating())
                .comment(dto.content())
                .selectedKeywords(keywordsStr)
                // .retransaction(dto.retransaction()) // ⭐ Entity에 필드 추가했다면 주석 해제
                .build();

        return reviewRepository.save(review).getReview_id();
    }

    // 2. ⭐ [수정됨] 리뷰 목록 조회 (타입별 필터링)
    public List<ReviewResDto> getReviews(Long userId, String type) {
        List<Review> reviews;

        if ("buyer".equalsIgnoreCase(type)) {
            // "구매자 후기" 탭 (내가 구매자로서 받은 후기)
            reviews = reviewRepository.findBuyerReviews(userId);
        } else if ("seller".equalsIgnoreCase(type)) {
            // "판매자 후기" 탭 (내가 판매자로서 받은 후기)
            reviews = reviewRepository.findSellerReviews(userId);
        } else {
            // "전체" 탭
            reviews = reviewRepository.findReviewsByUserId(userId);
        }

        return reviews.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // 3. ⭐ [추가됨] 작성 가능한 리뷰 조회
    public List<Map<String, Object>> getPendingReviews(Long userId) {
        // 1) 내 완료된 거래 조회
        List<Trade> myTrades = tradeRepository.findAllCompletedTrades(userId);
        
        // 2) 내가 이미 쓴 리뷰 조회 (tradeId만 추출)
        // (주의: 성능 최적화를 위해선 Repository에 existsByTradeAndFromUser 쿼리를 만드는 게 좋음)
        List<Review> writtenReviews = reviewRepository.findAll(); 
        List<Long> reviewedTradeIds = writtenReviews.stream()
                .filter(r -> r.getFromUser().getUser_id().equals(userId))
                .map(r -> r.getTrade().getTrade_id())
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();

        for (Trade t : myTrades) {
            if (reviewedTradeIds.contains(t.getTrade_id())) continue; // 이미 썼으면 패스

            User partner = t.getSeller().getUser_id().equals(userId) ? t.getBuyer() : t.getSeller();
            
            Map<String, Object> data = new HashMap<>();
            data.put("tradeId", t.getTrade_id());
            data.put("postId", t.getPost().getPost_id());
            data.put("postTitle", t.getPost().getTitle());
            if (!t.getPost().getImages().isEmpty()) {
                data.put("postImage", t.getPost().getImages().get(0).getUrl());
            }
            data.put("partnerId", partner.getUser_id());
            data.put("partnerNickname", partner.getNickname());
            
            result.add(data);
        }
        return result;
    }

    // DTO 변환 메서드 (코드 중복 제거)
    private ReviewResDto convertToDto(Review review) {
        List<String> keywordList = new ArrayList<>();
        if (review.getSelectedKeywords() != null && !review.getSelectedKeywords().isEmpty()) {
            for (String idStr : review.getSelectedKeywords().split(",")) {
                try {
                    keywordList.add(getKeywordText(Integer.parseInt(idStr.trim())));
                } catch (NumberFormatException e) {}
            }
        }

        return new ReviewResDto(
                review.getReview_id(),
                review.getFromUser().getNickname(),        // writerNickname
                review.getFromUser().getProfile_image_url(), // writerProfileUrl
                review.getRating(),
                review.getComment(),                       // content
                keywordList,
                review.getCreated_at()
        );
    }

    private String getKeywordText(int id) {
        switch (id) {
            case 1: return "시간 약속을 잘 지켜요 ⏰";
            case 2: return "친절하고 매너가 좋아요 😊";
            case 3: return "응답이 빨라요 ⚡";
            case 4: return "상품 상태가 설명과 같아요 📦";
            case 5: return "좋은 상품을 저렴하게 주셨어요 💸";
            case 6: return "시간 약속을 안 지켜요 😢";
            case 7: return "불친절해요 😡";
            case 8: return "연락이 잘 안 돼요 📱";
            case 9: return "상품 상태가 설명과 달라요 💔";
            case 10: return "약속 장소에 나타나지 않았어요 🚫";
            case 11: return "쿨거래 해주셨어요 😎";
            case 12: return "입금이 빨라요 💸";
            case 13: return "응답이 빨라요 ⚡";
            case 14: return "친절하고 매너가 좋아요 😊";
            case 15: return "시간 약속을 잘 지켜요 ⏰";
            case 16: return "무리한 네고를 요구해요 🙅‍♂️";
            case 17: return "시간 약속을 안 지켜요 😢";
            case 18: return "불친절해요 😡";
            case 19: return "연락이 잘 안 돼요 📱";
            case 20: return "약속 장소에 나타나지 않았어요 🚫";
            default: return "기타 후기";
        }
    }
}