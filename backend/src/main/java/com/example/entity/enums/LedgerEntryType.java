package com.example.entity.enums;

public enum LedgerEntryType {
    TOPUP_CARD,
    TOPUP_ACCOUNT,
    TRANSFER_OUT,
    TRANSFER_IN,
    TRADE_PAY,
    TRADE_PAYOUT,
    REFUND,
    FEE,

    // 출금 요청 / 거절
    WITHDRAW_REQUEST,
    WITHDRAW_REJECT
}
