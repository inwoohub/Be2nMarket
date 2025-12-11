// src/main/java/com/example/repository/WalletRepository.java
package com.example.repository;

import com.example.entity.User;
import com.example.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from Wallet w where w.user.user_id = :userId")
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Long userId);


    @Query("select coalesce(sum(w.balance), 0) from Wallet w")
    long sumAllBalance();

}
