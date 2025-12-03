// src/main/java/com/example/dto/WithdrawRequestDto.java
package com.example.dto;

import com.example.entity.WithdrawRequest;
import com.example.entity.enums.WithdrawStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestDto {

    private Long id;

    private Long userId;
    private String userNickname;

    private Long amount;

    private String bankCode;
    private String accountNumber;
    private String accountHolder;

    private WithdrawStatus status;
    private String rejectReason;

    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private LocalDateTime rejectedAt;

    private Long adminId;
    private String adminNickname;

    public static WithdrawRequestDto fromEntity(WithdrawRequest wr) {
        return WithdrawRequestDto.builder()
                .id(wr.getWithdraw_request_id())
                .userId(wr.getUser().getUser_id())
                .userNickname(
                        wr.getUser().getNickname() // 없다면 getName() 등으로 변경
                )
                .amount(wr.getAmount())
                .bankCode(wr.getBank_code())
                .accountNumber(wr.getAccount_number())
                .accountHolder(wr.getAccount_holder())
                .status(wr.getStatus())
                .rejectReason(wr.getReject_reason())
                .requestedAt(wr.getRequested_at())
                .completedAt(wr.getCompleted_at())
                .rejectedAt(wr.getRejected_at())
                .adminId(
                        wr.getAdmin() != null ? wr.getAdmin().getUser_id() : null
                )
                .adminNickname(
                        wr.getAdmin() != null ? wr.getAdmin().getNickname() : null
                )
                .build();
    }
}
