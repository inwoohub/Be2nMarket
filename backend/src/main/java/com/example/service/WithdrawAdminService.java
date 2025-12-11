package com.example.service;

import com.example.dto.WithdrawRequestDto;
import com.example.entity.User;
import com.example.entity.Wallet;
import com.example.entity.WalletLedger;
import com.example.entity.WithdrawRequest;
import com.example.entity.enums.LedgerEntryType;
import com.example.entity.enums.WithdrawStatus;
import com.example.repository.UserRepository;
import com.example.repository.WalletLedgerRepository;
import com.example.repository.WalletRepository;
import com.example.repository.WithdrawRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WithdrawAdminService {

    private final WithdrawRequestRepository withdrawRequestRepository;
    private final WalletRepository walletRepository;
    private final WalletLedgerRepository walletLedgerRepository;
    private final UserRepository userRepository;

    private User getAdminOrThrow(Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 없음"));

        if (!"admin".equals(admin.getRole())) {
            throw new IllegalStateException("관리자 권한이 없습니다.");
        }
        return admin;
    }


    @Transactional(readOnly = true)
    public Page<WithdrawRequestDto> getList(Long adminUserId ,WithdrawStatus status, Pageable pageable) {

        getAdminOrThrow(adminUserId);

        Page<WithdrawRequest> page;

        if (status != null) {
            page = withdrawRequestRepository.findByStatus(status, pageable);
        } else {
            page = withdrawRequestRepository.findAll(pageable);
        }

        return page.map(WithdrawRequestDto::fromEntity);
    }


    @Transactional
    public void approve(Long adminUserId, Long withdrawRequestId) {

        User admin = getAdminOrThrow(adminUserId);

        WithdrawRequest wr = withdrawRequestRepository.findByIdForUpdate(withdrawRequestId)
                .orElseThrow(() -> new IllegalArgumentException("출금 요청 없음"));

        if (wr.getStatus() != WithdrawStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        wr.setStatus(WithdrawStatus.COMPLETED);
        wr.setCompleted_at(LocalDateTime.now());
        wr.setAdmin(admin);
    }

    @Transactional
    public void reject(Long adminUserId, Long withdrawRequestId, String reason) {

        User admin = getAdminOrThrow(adminUserId);

        WithdrawRequest wr = withdrawRequestRepository.findByIdForUpdate(withdrawRequestId)
                .orElseThrow(() -> new IllegalArgumentException("출금 요청 없음"));

        if (wr.getStatus() != WithdrawStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        User user = wr.getUser();
        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getUser_id())
                .orElseThrow(() -> new IllegalStateException("지갑 없음"));

        Long amount = wr.getAmount();
        Long newBalance = wallet.getBalance() + amount;
        wallet.setBalance(newBalance);

        WalletLedger ledger = WalletLedger.builder()
                .user(user)
                .entry_type(LedgerEntryType.WITHDRAW_REJECT)
                .amount(amount)
                .fee_amount(0L)
                .balance_after(newBalance)
                .memo("출금 거절: " + reason)
                .build();
        walletLedgerRepository.save(ledger);

        wr.setStatus(WithdrawStatus.REJECTED);
        wr.setRejected_at(LocalDateTime.now());
        wr.setReject_reason(reason);
        wr.setAdmin(admin);
    }
}

