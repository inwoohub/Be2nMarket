package com.example.controller;

import com.example.dto.ReviewReqDto;
import com.example.dto.ReviewResDto;
import com.example.service.ReviewService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 1. 리뷰 작성
    @PostMapping
    public ResponseEntity<?> writeReview(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody ReviewReqDto reviewReqDto) {

        if (sessionUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
        Long reviewId = reviewService.createReview(sessionUser.id(), reviewReqDto);
        return ResponseEntity.ok(reviewId);
    }

    // 2. ⭐ [수정됨] 리뷰 목록 조회 (필터링 type 파라미터 추가)
    // 호출 예: /api/reviews/list/100?type=seller
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<ReviewResDto>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "all") String type) {
        
        List<ReviewResDto> reviews = reviewService.getReviews(userId, type);
        return ResponseEntity.ok(reviews);
    }

    // 3. ⭐ [추가됨] 작성 가능한 리뷰 조회
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReviews(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser) {
        
        if (sessionUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Map<String, Object>> pending = reviewService.getPendingReviews(sessionUser.id());
        return ResponseEntity.ok(pending);
    }
}