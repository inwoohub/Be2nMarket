// src/main/java/com/example/config/TossPaymentProperties.java
package com.example.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class TossPaymentProperties {

    @Value("${toss.secret-key}")
    private String secretKey;


    @Value("${toss.confirm-url}")
    private String confirmUrl;
}

