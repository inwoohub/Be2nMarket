// src/test/java/com/example/service/WithdrawServiceTest.java
package com.example.service;

import com.example.dto.WithdrawRequestCreateDto;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class WithdrawServiceTest {

    @Mock
    WalletRepository walletRepository;

    @Mock
    WalletLedgerRepository walletLedgerRepository;

    @Mock
    WithdrawRequestRepository withdrawRequestRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    WithdrawService withdrawService;

    @Test
    void 출금_정상_요청_성공() {

        // given
        Long userId = 1L;

        User user = User.builder()
                .user_id(userId)
                .nickname("테스트유저")
                .build();

        Wallet wallet = Wallet.builder()
                .wallet_id(10L)
                .user(user)
                .balance(10_000L)
                .build();

        WithdrawRequestCreateDto dto = new WithdrawRequestCreateDto();
        dto.setAmount(5_000L);
        dto.setBankCode("004");
        dto.setAccountNumber("1234567890");
        dto.setAccountHolder("홍길동");

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(walletRepository.findByUserIdForUpdate(userId)).willReturn(Optional.of(wallet));

        given(withdrawRequestRepository.save(any(WithdrawRequest.class)))
                .willAnswer(invocation -> invocation.getArgument(0));


        // when
        WithdrawRequest result = withdrawService.createWithdrawRequest(userId, dto);


        // then

        assertThat(wallet.getBalance()).isEqualTo(5_000L);


        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getAmount()).isEqualTo(5_000L);
        assertThat(result.getStatus()).isEqualTo(WithdrawStatus.PENDING);
        assertThat(result.getBank_code()).isEqualTo("004");
        assertThat(result.getAccount_number()).isEqualTo("1234567890");
        assertThat(result.getAccount_holder()).isEqualTo("홍길동");

        ArgumentCaptor<WalletLedger> ledgerCaptor = ArgumentCaptor.forClass(WalletLedger.class);
        verify(walletLedgerRepository, times(1)).save(ledgerCaptor.capture());

        WalletLedger savedLedger = ledgerCaptor.getValue();
        assertThat(savedLedger.getUser()).isEqualTo(user);
        assertThat(savedLedger.getEntry_type()).isEqualTo(LedgerEntryType.WITHDRAW_REQUEST);
        assertThat(savedLedger.getAmount()).isEqualTo(5_000L);
        assertThat(savedLedger.getBalance_after()).isEqualTo(5_000L);

        verify(withdrawRequestRepository, times(1)).save(any(WithdrawRequest.class));
    }

    @Test
    void 출금_잔액부족_예외() {
        // given
        Long userId = 1L;

        User user = User.builder()
                .user_id(userId)
                .nickname("테스트유저")
                .build();

        Wallet wallet = Wallet.builder()
                .wallet_id(10L)
                .user(user)
                .balance(3_000L)
                .build();

        WithdrawRequestCreateDto dto = new WithdrawRequestCreateDto();
        dto.setAmount(5_000L);
        dto.setBankCode("004");
        dto.setAccountNumber("1234567890");
        dto.setAccountHolder("홍길동");

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(walletRepository.findByUserIdForUpdate(userId)).willReturn(Optional.of(wallet));

        // when & then
        assertThatThrownBy(() -> withdrawService.createWithdrawRequest(userId, dto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("잔액 부족");
    }
}
