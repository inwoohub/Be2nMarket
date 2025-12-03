package com.example.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostDetailResponseDto {

    private Long postId;
    private String title;
    private String category; // 카테고리명
    private Long price;
    private String content; // 상세 내용
    private String location; // 지역명
    private String status; // 판매 상태

    private List<String> imageUrls; // 전체 이미지 URL 리스트

    private int viewCount;
    private LocalDateTime createdAt;

    // 판매자 정보 (채팅하기 버튼 누를 때 필요)
    private Long sellerId;
    private String sellerNickname;
    private String sellerProfileImage;
    private BigDecimal sellerMannerScore; // 매너온도
}