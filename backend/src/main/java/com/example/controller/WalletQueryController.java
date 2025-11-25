// src/main/java/com/example/controller/WalletQueryController.java
package com.example.controller;

import com.example.service.WalletService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wallet")
public class WalletQueryController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<?> getMyBalance(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "reason", "NOT_LOGGED_IN"
                    ));
        }
        Long balance = walletService.getBalance(sessionUser.id());


        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "balance", balance
                )
        );
    }
}
