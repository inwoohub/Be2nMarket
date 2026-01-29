package com.example.dto;

public record TradeCompleteReqDto(
    Long postId,
    Long buyerId // 선택한 구매자의 ID
) {}