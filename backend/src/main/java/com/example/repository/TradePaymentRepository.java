// src/main/java/com/example/repository/TradePaymentRepository.java
package com.example.repository;

import com.example.entity.TradePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TradePaymentRepository extends JpaRepository<TradePayment, Long> {

}
