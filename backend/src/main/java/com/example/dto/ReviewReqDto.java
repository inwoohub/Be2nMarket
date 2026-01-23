package com.example.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

// 프론트에서 넘어오는 데이터 형태
public record ReviewReqDto(
    @NotNull Long tradeId,       // 어떤 거래에 대한 후기인지
    @NotNull Long targetUserId,  // 누구에게 쓰는 후기인지
    @NotNull @Min(1) @Max(5) Byte rating, // 별점
    String content,              // 상세 내용
    List<Integer> keywords       // 선택한 키워드 리스트 [1, 3, 5]
) {}