// src/main/java/com/example/service/WalletPaymentService.java
package com.example.service;

import com.example.config.TossPaymentProperties;
import com.example.entity.*;
import com.example.entity.enums.*;
import com.example.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class WalletPaymentService {

    private final TossPaymentProperties tossProps;
    private final TradePaymentRepository tradePaymentRepository;
    private final WalletRepository walletRepository;
    private final WalletLedgerRepository walletLedgerRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper; // JSON 파싱용

    private record TossConfirmResult(
            String status,
            String method,
            String easyPayProvider,
            String rawResponse
    ) {}

    @Transactional
    public void confirmTopup(Long userId, String paymentKey, String orderId, Long amount) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));


        TradePayment tradePayment = TradePayment.builder()
                .user(user)
                .trade(null)
                .method_type(null)
                .purpose(TradePaymentPurpose.TOPUP)
                .amount(amount)
                .fee_amount(0L)
                .status(TradePaymentStatus.PENDING)
                .provider_tx_id(paymentKey)
                .build();
        tradePaymentRepository.save(tradePayment);

        TossConfirmResult tossResult = confirmWithToss(paymentKey, orderId, amount);

        tradePayment.setPaymentKey(paymentKey);
        tradePayment.setOrderId(orderId);
        tradePayment.setPg_status(tossResult.status());
        tradePayment.setPg_raw_response(tossResult.rawResponse());

        tradePayment.setMethod_type(
                PaymentMethodType.fromCode(tossResult.method())
        );

        tradePayment.setEasyPayType(
                EasyPayType.fromCode(tossResult.easyPayProvider())
        );

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .user(user)
                            .balance(0L)
                            .build();
                    return walletRepository.save(w);
                });

        Long newBalance = wallet.getBalance() + amount;
        wallet.setBalance(newBalance);

        WalletLedger ledger = WalletLedger.builder()
                .user(user)
                .trade(null)
                .relatedUser(null)
                .entry_type(LedgerEntryType.TOPUP_CARD)
                .amount(amount)
                .fee_amount(0L)
                .balance_after(newBalance)
                .memo("토스 충전")
                .build();
        walletLedgerRepository.save(ledger);


        tradePayment.setStatus(TradePaymentStatus.SUCCEEDED);
    }

    private TossConfirmResult confirmWithToss(String paymentKey, String orderId, Long amount) {
        try {

            String auth = tossProps.getSecretKey() + ":";
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> body = Map.of(
                    "paymentKey", paymentKey,
                    "orderId", orderId,
                    "amount", amount
            );
            String json = objectMapper.writeValueAsString(body);

            HttpURLConnection conn = (HttpURLConnection) new URL(tossProps.getConfirmUrl()).openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Basic " + encodedAuth);
            conn.setRequestProperty("Content-Type", "application/json");

            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes(StandardCharsets.UTF_8));
            }

            int statusCode = conn.getResponseCode();
            if (statusCode != 200) {
                InputStream errStream = conn.getErrorStream();
                String err = new String(errStream.readAllBytes(), StandardCharsets.UTF_8);
                throw new IllegalStateException("Toss 승인 실패: " + statusCode + " / " + err);
            }

            InputStream is = conn.getInputStream();
            String resp = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            // 🔵 JSON 파싱
            Map<String, Object> respMap = objectMapper.readValue(
                    resp, new TypeReference<Map<String, Object>>() {}
            );

            String status = (String) respMap.get("status");
            String method = (String) respMap.get("method");

            String easyPayProvider = null;
            Object easyPayObj = respMap.get("easyPay");
            if (easyPayObj instanceof Map<?, ?> easyPayMap) {
                Object provider = easyPayMap.get("provider");
                if (provider != null) {
                    easyPayProvider = provider.toString();
                }
            }
            log.debug("[TOSS CONFIRM] method={}, easyPayProvider={}", method, easyPayProvider);


            return new TossConfirmResult(status, method, easyPayProvider, resp);

        } catch (IOException e) {
            throw new RuntimeException("Toss 승인 요청 중 에러", e);
        }
    }
}
