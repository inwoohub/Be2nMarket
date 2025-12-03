package com.example.service;

import com.example.dto.WithdrawRequestCreateDto;
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
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WithdrawService {

    private final WalletRepository walletRepository;
    private final WalletLedgerRepository walletLedgerRepository;
    private final WithdrawRequestRepository withdrawRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public WithdrawRequest createWithdrawRequest(Long userId, WithdrawRequestCreateDto dto) {
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("출금 금액이 올바르지 않습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalStateException("지갑 없음"));

        Long amount = dto.getAmount();

        if (wallet.getBalance() < amount) {
            throw new IllegalStateException("잔액 부족");
        }

        Long newBalance = wallet.getBalance() - amount;
        wallet.setBalance(newBalance);

        WalletLedger ledger = WalletLedger.builder()
                .user(user)
                .entry_type(LedgerEntryType.WITHDRAW_REQUEST)
                .amount(amount)
                .fee_amount(0L)
                .balance_after(newBalance)
                .memo("출금 요청")
                .build();
        walletLedgerRepository.save(ledger);

        WithdrawRequest withdrawRequest = WithdrawRequest.builder()
                .user(user)
                .amount(amount)
                .bank_code(dto.getBankCode())
                .account_number(dto.getAccountNumber())
                .account_holder(dto.getAccountHolder())
                .status(WithdrawStatus.PENDING)
                .build();

        return withdrawRequestRepository.save(withdrawRequest);
    }
}
