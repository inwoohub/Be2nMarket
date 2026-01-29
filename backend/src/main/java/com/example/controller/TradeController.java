package com.example.controller;

import com.example.dto.BuyerCandidateDto;
import com.example.dto.TradeCompleteReqDto;
import com.example.service.TradeService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    // 1. 구매자 후보(채팅한 사람) 목록 조회
    // GET /api/trade/candidates?postId=1
    @GetMapping("/candidates")
    public ResponseEntity<List<BuyerCandidateDto>> getCandidates(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestParam Long postId) {

        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<BuyerCandidateDto> candidates = tradeService.getBuyerCandidates(sessionUser.id(), postId);
        return ResponseEntity.ok(candidates);
    }

    // 2. 거래 확정 (판매 완료)
    // POST /api/trade/confirm
    @PostMapping("/confirm")
    public ResponseEntity<Long> confirmTrade(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody TradeCompleteReqDto reqDto) {

        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 거래 생성 후 생성된 trade_id를 반환 (리뷰 작성을 위해)
        Long tradeId = tradeService.completeTrade(sessionUser.id(), reqDto);
        
        return ResponseEntity.ok(tradeId);
    }
}