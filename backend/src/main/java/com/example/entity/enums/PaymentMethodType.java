// src/main/java/com/example/entity/enums/PaymentMethodType.java
package com.example.entity.enums;

public enum PaymentMethodType {
    CARD,
    EASY_PAY,
    VIRTUAL_ACCOUNT,
    MOBILE_PHONE,
    TRANSFER,
    CULTURE_GIFT_CERTIFICATE,
    BOOK_GIFT_CERTIFICATE,
    GAME_GIFT_CERTIFICATE;

    public static PaymentMethodType fromCode(String code) {
        if (code == null) return null;
        return switch (code) {
            case "CARD", "카드" -> CARD;
            case "EASY_PAY", "간편결제" -> EASY_PAY;
            case "VIRTUAL_ACCOUNT", "가상계좌" -> VIRTUAL_ACCOUNT;
            case "MOBILE_PHONE", "휴대폰" -> MOBILE_PHONE;
            case "TRANSFER", "계좌이체" -> TRANSFER;
            case "CULTURE_GIFT_CERTIFICATE", "문화상품권" -> CULTURE_GIFT_CERTIFICATE;
            case "BOOK_GIFT_CERTIFICATE", "도서문화상품권" -> BOOK_GIFT_CERTIFICATE;
            case "GAME_GIFT_CERTIFICATE", "게임문화상품권" -> GAME_GIFT_CERTIFICATE;
            default -> null;
        };
    }
}
