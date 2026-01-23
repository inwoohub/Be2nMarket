package com.example.controller;

import com.example.dto.ReviewReqDto;
import com.example.service.ReviewService;
import com.example.session.SessionUser; // SessionUser import 필수
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> writeReview(
            // ⭐ [핵심 수정] Spring Security 대신, 기존에 쓰던 세션 방식을 사용합니다.
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody ReviewReqDto reviewReqDto) {

        // 1. 로그인 체크 (세션에 USER가 없으면 401 에러)
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 2. 세션에서 안전하게 ID 추출
        Long currentUserId = sessionUser.id();
        System.out.println(">>> 세션에서 가져온 유저 ID: " + currentUserId);

        // 3. (보안 강화) 프론트에서 보낸 작성자와 세션의 작성자가 일치하는지 확인 (선택 사항)
        // 본인 확인을 위해 프론트에서 받은 데이터와 비교해도 되지만, 
        // 서비스에는 무조건 '세션 ID'를 넘기는 것이 가장 안전합니다.
        
        Long reviewId = reviewService.createReview(currentUserId, reviewReqDto);
        
        return ResponseEntity.ok(reviewId);
    }
}