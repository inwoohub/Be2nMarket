package com.example.service;

import com.example.dto.WalletLedgerDto;
import com.example.entity.User;
import com.example.entity.enums.LedgerEntryType;
import com.example.entity.enums.WithdrawStatus;
import com.example.repository.UserRepository;
import com.example.repository.WalletLedgerRepository;
import com.example.repository.WalletRepository;
import com.example.repository.WithdrawRequestRepository;
import com.example.service.WithdrawAdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletLedgerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletLedgerRepository walletLedgerRepository;

    @Mock
    private WithdrawRequestRepository withdrawRequestRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private WithdrawAdminService withdrawAdminService;

    @Test
    void getLedgerSummary_정상계산() {
        // given
        Long adminUserId = 1L;

        User admin = new User();
        admin.setUser_id(adminUserId);   // ✅ User 엔티티 필드명에 맞게
        admin.setRole("admin");          // ✅ 관리자 권한

        when(userRepository.findById(adminUserId))
                .thenReturn(Optional.of(admin));

        // 총 충전액 / 건수
        when(walletLedgerRepository.sumAmountByEntryTypes(anyList()))
                .thenReturn(10_000L);   // 충전 총액 10,000
        when(walletLedgerRepository.countByEntryTypes(anyList()))
                .thenReturn(5L);        // 충전 건수 5건

        // 출금 완료
        when(withdrawRequestRepository.sumAmountByStatus(WithdrawStatus.COMPLETED))
                .thenReturn(3_000L);    // 완료 출금액 3,000
        when(withdrawRequestRepository.countByStatus(WithdrawStatus.COMPLETED))
                .thenReturn(2L);        // 완료 출금 2건

        // 출금 대기
        when(withdrawRequestRepository.sumAmountByStatus(WithdrawStatus.PENDING))
                .thenReturn(1_000L);    // 대기 출금액 1,000
        when(withdrawRequestRepository.countByStatus(WithdrawStatus.PENDING))
                .thenReturn(1L);        // 대기 출금 1건

        // 유저 잔액 합
        when(walletRepository.sumAllBalance())
                .thenReturn(7_000L);    // 전체 잔액 7,000

        // when
        WalletLedgerDto dto = withdrawAdminService.getLedgerSummary(adminUserId);

        // then
        assertEquals(10_000L, dto.totalTopupAmount());
        assertEquals(5L, dto.totalTopupCount());

        assertEquals(3_000L, dto.totalWithdrawCompletedAmount());
        assertEquals(2L, dto.totalWithdrawCompletedCount());

        assertEquals(1_000L, dto.totalWithdrawPendingAmount());
        assertEquals(1L, dto.totalWithdrawPendingCount());

        assertEquals(7_000L, dto.totalUserBalance());

        // diff = totalTopupAmount - (totalUserBalance + totalWithdrawCompletedAmount)
        //      = 10,000 - (7,000 + 3,000) = 0
        assertEquals(0L, dto.diff());

        // getAdminOrThrow 호출 확인 (선택)
        verify(userRepository).findById(adminUserId);

        System.out.println("admin userId: " + adminUserId);
    }

    @Test
    void getLedgerSummary_관리자아니면_예외() {
        // given
        Long userId = 2L;

        User normalUser = new User();
        normalUser.setUser_id(userId);
        normalUser.setRole("user");  // ❌ admin 아님

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(normalUser));

        // when & then
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> withdrawAdminService.getLedgerSummary(userId)
        );

        assertEquals("관리자 권한이 없습니다.", ex.getMessage());
    }
}
