package com.example.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewResDto(
    Long reviewId,
    String writerNickname,   // 작성자 닉네임
    String writerProfileUrl, // 작성자 프사
    Byte rating,             // 별점
    String content,          // 내용
    List<String> keywords,   // ["친절해요", "빨라요"] 형태로 변환된 키워드
    LocalDateTime createdAt  // 작성일
) {}