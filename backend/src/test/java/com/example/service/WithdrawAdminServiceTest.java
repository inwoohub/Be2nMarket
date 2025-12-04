// src/test/java/com/example/service/WithdrawAdminServiceTest.java
package com.example.service;

import com.example.dto.WalletLedgerDto;
import com.example.dto.WithdrawRequestDto;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class WithdrawAdminServiceTest {

    @Mock
    WithdrawRequestRepository withdrawRequestRepository;

    @Mock
    WalletRepository walletRepository;

    @Mock
    WalletLedgerRepository walletLedgerRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    WithdrawAdminService withdrawAdminService;

    @Test
    void 출금요청_목록_조회() {
        // given
        Long adminUserId = 10L;
        Pageable pageable = PageRequest.of(0, 10);
        User admin = User.builder()
                .user_id(adminUserId)
                .nickname("관리자")
                .role("admin")
                .build();

        User user = User.builder()
                .user_id(1L)
                .nickname("유저")
                .build();

        WithdrawRequest wr = WithdrawRequest.builder()
                .withdraw_request_id(100L)
                .user(user)
                .amount(5_000L)
                .status(WithdrawStatus.PENDING)
                .requested_at(LocalDateTime.now())
                .build();

        Page<WithdrawRequest> page = new PageImpl<>(List.of(wr), pageable, 1);

        given(withdrawRequestRepository.findByStatus(WithdrawStatus.PENDING, pageable))
                .willReturn(page);

        // when
        Page<WithdrawRequestDto> result = withdrawAdminService.getList(adminUserId ,WithdrawStatus.PENDING, pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        WithdrawRequestDto dto = result.getContent().get(0);
        assertThat(dto.getId()).isEqualTo(100L);
        assertThat(dto.getAmount()).isEqualTo(5_000L);
        assertThat(dto.getStatus()).isEqualTo(WithdrawStatus.PENDING);
    }

    @Test
    void 출금_승인_성공() {
        // given
        Long adminUserId = 10L;
        Long withdrawRequestId = 100L;

        User admin = User.builder().user_id(adminUserId).nickname("관리자").build();

        User user = User.builder().user_id(1L).nickname("유저").build();

        WithdrawRequest wr = WithdrawRequest.builder()
                .withdraw_request_id(withdrawRequestId)
                .user(user)
                .amount(5_000L)
                .status(WithdrawStatus.PENDING)
                .build();

        given(userRepository.findById(adminUserId)).willReturn(Optional.of(admin));
        given(withdrawRequestRepository.findByIdForUpdate(withdrawRequestId)).willReturn(Optional.of(wr));

        // when
        withdrawAdminService.approve(adminUserId, withdrawRequestId);

        // then
        assertThat(wr.getStatus()).isEqualTo(WithdrawStatus.COMPLETED);
        assertThat(wr.getAdmin()).isEqualTo(admin);
        assertThat(wr.getCompleted_at()).isNotNull();

        verify(walletLedgerRepository, never()).save(any(WalletLedger.class));
    }

    @Test
    void 출금_거절_성공() {
        // given
        Long adminUserId = 10L;
        Long withdrawRequestId = 100L;

        User admin = User.builder().user_id(adminUserId).nickname("관리자").build();

        User user = User.builder().user_id(1L).nickname("유저").build();

        Wallet wallet = Wallet.builder()
                .wallet_id(1L)
                .user(user)
                .balance(5_000L) // 현재 DB 상에는 이미 차감된 상태라고 가정
                .build();

        WithdrawRequest wr = WithdrawRequest.builder()
                .withdraw_request_id(withdrawRequestId)
                .user(user)
                .amount(5_000L)
                .status(WithdrawStatus.PENDING)
                .build();

        given(userRepository.findById(adminUserId)).willReturn(Optional.of(admin));
        given(withdrawRequestRepository.findByIdForUpdate(withdrawRequestId)).willReturn(Optional.of(wr));
        given(walletRepository.findByUserIdForUpdate(user.getUser_id())).willReturn(Optional.of(wallet));

        // when
        withdrawAdminService.reject(adminUserId, withdrawRequestId, "테스트 거절");

        // then
        assertThat(wr.getStatus()).isEqualTo(WithdrawStatus.REJECTED);
        assertThat(wr.getReject_reason()).isEqualTo("테스트 거절");
        assertThat(wr.getAdmin()).isEqualTo(admin);
        assertThat(wr.getRejected_at()).isNotNull();

        assertThat(wallet.getBalance()).isEqualTo(10_000L);

        ArgumentCaptor<WalletLedger> ledgerCaptor = ArgumentCaptor.forClass(WalletLedger.class);
        verify(walletLedgerRepository, times(1)).save(ledgerCaptor.capture());

        WalletLedger savedLedger = ledgerCaptor.getValue();
        assertThat(savedLedger.getUser()).isEqualTo(user);
        assertThat(savedLedger.getEntry_type()).isEqualTo(LedgerEntryType.WITHDRAW_REJECT);
        assertThat(savedLedger.getAmount()).isEqualTo(5_000L);
        assertThat(savedLedger.getBalance_after()).isEqualTo(10_000L);
    }


    User admin;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setUser_id(1L);
        admin.setRole("admin");
    }

    @Test
    void getLedgerSummary_정상_계산() {

        // given
        Long adminId = 1L;


        when(userRepository.findById(adminId))
                .thenReturn(java.util.Optional.of(admin));

        // 총 충전액: 30000
        when(walletLedgerRepository.sumAmountByEntryTypes(
                List.of(LedgerEntryType.TOPUP_CARD, LedgerEntryType.TOPUP_ACCOUNT)
        )).thenReturn(30_000L);

        // 충전 건수: 3건
        when(walletLedgerRepository.countByEntryTypes(
                List.of(LedgerEntryType.TOPUP_CARD, LedgerEntryType.TOPUP_ACCOUNT)
        )).thenReturn(3L);

        // 출금 완료 합계: 10000
        when(withdrawRequestRepository.sumAmountByStatus(WithdrawStatus.COMPLETED))
                .thenReturn(10_000L);
        when(withdrawRequestRepository.countByStatus(WithdrawStatus.COMPLETED))
                .thenReturn(2L);

        // 출금 대기 합계: 5000
        when(withdrawRequestRepository.sumAmountByStatus(WithdrawStatus.PENDING))
                .thenReturn(5_000L);
        when(withdrawRequestRepository.countByStatus(WithdrawStatus.PENDING))
                .thenReturn(1L);

        // 전체 유저 잔액 합: 20000
        when(walletRepository.sumAllBalance())
                .thenReturn(20_000L);

        // when
        WalletLedgerDto dto = withdrawAdminService.getLedgerSummary(adminId);

        // then
        assertThat(dto.totalTopupAmount()).isEqualTo(30_000L);
        assertThat(dto.totalUserBalance()).isEqualTo(20_000L);
        assertThat(dto.totalWithdrawCompletedAmount()).isEqualTo(10_000L);
        assertThat(dto.diff()).isEqualTo(0L); // 30000 - (20000 + 10000)

        // 관리자 검증 메소드가 실제로 불렸는지도 체크
        verify(userRepository).findById(adminId);
    }
}
