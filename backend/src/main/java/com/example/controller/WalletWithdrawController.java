package com.example.controller;

import com.example.dto.WithdrawRequestCreateDto;
import com.example.entity.WithdrawRequest;
import com.example.service.WithdrawService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wallet/withdraw-requests")
public class WalletWithdrawController {

    private final WithdrawService withdrawService;

    @PostMapping
    public ResponseEntity<?> createWithdrawRequest(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody WithdrawRequestCreateDto dto
    ) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "로그인이 필요합니다."
            ));
        }

        WithdrawRequest wr = withdrawService.createWithdrawRequest(sessionUser.id(), dto);

        return ResponseEntity.ok(Map.of(
                "id", wr.getWithdraw_request_id(),
                "status", wr.getStatus(),
                "amount", wr.getAmount()
        ));
    }
}
