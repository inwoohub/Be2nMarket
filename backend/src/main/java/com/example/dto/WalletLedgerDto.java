// com.example.dto 패키지 등
package com.example.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record WalletLedgerDto(
        long totalTopupAmount,          // 총 충전액
        long totalTopupCount,           // 충전 건수

        long totalWithdrawCompletedAmount,  // 완료된 출금액
        long totalWithdrawCompletedCount,   // 완료 출금 건수

        long totalWithdrawPendingAmount,    // 대기중 출금액
        long totalWithdrawPendingCount,     // 대기중 출금 건수

        long totalUserBalance,          // 모든 유저 지갑 잔액 합

        long diff,                      // totalTopup - (totalUserBalance + totalWithdrawCompletedAmount)

        LocalDateTime generatedAt       // 기준 시각
) {}
