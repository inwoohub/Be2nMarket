// src/main/java/com/example/entity/enums/EasyPayType.java

package com.example.entity.enums;

public enum EasyPayType {
    TOSSPAY,
    NAVERPAY,
    SAMSUNGPAY,
    LPAY,
    KAKAOPAY,
    PAYCO,
    SSG,
    APPLEPAY,
    PINPAY;

    public static EasyPayType fromCode(String code) {
        if (code == null) return null;
        return switch (code) {
            case "TOSSPAY", "토스페이", "토스결제" -> TOSSPAY;
            case "NAVERPAY", "네이버페이" -> NAVERPAY;
            case "SAMSUNGPAY", "삼성페이" -> SAMSUNGPAY;
            case "LPAY", "엘페이" -> LPAY;
            case "KAKAOPAY", "카카오페이" -> KAKAOPAY;
            case "PAYCO", "페이코" -> PAYCO;
            case "SSG", "SSG페이" -> SSG;
            case "APPLEPAY", "애플페이" -> APPLEPAY;
            case "PINPAY", "핀페이" -> PINPAY;
            default -> null;
        };
    }
}


