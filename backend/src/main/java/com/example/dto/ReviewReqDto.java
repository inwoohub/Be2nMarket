package com.example.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReviewReqDto(
    @NotNull Long tradeId,       // 거래 ID
    @NotNull Long targetUserId,  // 받는 사람 ID
    @NotNull @Min(1) @Max(5) Byte rating, // 별점
    String content,              // 내용
    List<Integer> keywords,      // 키워드 ID 리스트
    Boolean retransaction        // ⭐ [추가됨] 재거래 희망 여부
) {}