// src/main/java/com/example/service/WalletService.java
package com.example.service;

import com.example.entity.User;
import com.example.entity.Wallet;
import com.example.repository.UserRepository;
import com.example.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;


    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        return walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet wallet = new Wallet();
                    wallet.setUser(user);
                    wallet.setBalance(0L);
                    return walletRepository.save(wallet);
                });

    }

    @Transactional(readOnly = true)
    public Long getBalance(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저: " + userId));


        return walletRepository.findByUser(user)
                .map(Wallet::getBalance)
                .orElse(0L);  // 지갑 없으면 0원
    }

}
