// src/main/java/com/example/controller/WalletPaymentController.java
package com.example.controller;

import com.example.service.WalletPaymentService;
import com.example.session.SessionUser;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wallet")
public class WalletPaymentController {

    private final WalletPaymentService walletPaymentService;

    @PostMapping("/topup/confirm")
    public ResponseEntity<Map<String, Boolean>> confirmTopup(
            @RequestBody TossConfirmRequest dto,
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }


        walletPaymentService.confirmTopup(
                sessionUser.id(),   // 세션에 저장해둔 userId
                dto.getPaymentKey(),
                dto.getOrderId(),
                dto.getAmount()
        );

        return ResponseEntity.ok(
                Map.of("success", true)
        );
    }

    @Getter
    @Setter
    public static class TossConfirmRequest {
        private String paymentKey;
        private String orderId;
        private Long amount;
    }
}
