package com.example.entity.enums;

public enum WithdrawStatus {
    PENDING,     // 유저가 요청, 관리자 확인 전
    COMPLETED,   // 관리자 실제 이체까지 완료
    REJECTED     // 관리자 거절
}

