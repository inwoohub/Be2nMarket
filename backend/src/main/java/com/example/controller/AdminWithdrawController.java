package com.example.controller;

import com.example.dto.WithdrawRequestDto;
import com.example.entity.enums.WithdrawStatus;
import com.example.service.WithdrawAdminService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/withdraw-requests")
public class AdminWithdrawController {

    private final WithdrawAdminService withdrawAdminService;

    @GetMapping
    public Page<WithdrawRequestDto> list(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestParam(required = false, defaultValue = "PENDING") WithdrawStatus status,
            Pageable pageable
    ) {
        if (sessionUser == null) {
            throw new RuntimeException("관리자 로그인 필요");
        }

        return withdrawAdminService.getList(sessionUser.id() ,status, pageable);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @PathVariable Long id
    ) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).build();
        }

        withdrawAdminService.approve(sessionUser.id(), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).build();
        }

        String reason = body.getOrDefault("reason", "관리자 거절");
        withdrawAdminService.reject(sessionUser.id(), id, reason);
        return ResponseEntity.ok().build();
    }
}
