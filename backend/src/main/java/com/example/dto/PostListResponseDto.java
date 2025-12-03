package com.example.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostListResponseDto {

    private Long postId;
    private String title;
    private Long price;
    private String location; // 지역명 (예: 역삼동)
    private String thumbnailUrl; // 목록에 보여줄 대표 사진 1장
    private String status; // 판매 상태 (ON_SALE, SOLD 등)
    private LocalDateTime createdAt; // 작성 시간

    // 아래 필드들은 나중에 좋아요/채팅 기능 구현 시 활용
    private int likeCount;
    private int chatCount;
}