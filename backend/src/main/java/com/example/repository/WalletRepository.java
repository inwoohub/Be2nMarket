// src/main/java/com/example/repository/WalletRepository.java
package com.example.repository;

import com.example.entity.User;
import com.example.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUser(User user);

}
