package com.example.dto;

public record PendingReviewResponseDto(
    Long tradeId,
    Long postId,
    String postTitle,
    String postImage,
    Long partnerId,
    String partnerNickname
) {}