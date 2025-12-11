package com.example.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawRequestCreateDto {
    private Long amount;
    private String bankCode;
    private String accountNumber;
    private String accountHolder;
}
