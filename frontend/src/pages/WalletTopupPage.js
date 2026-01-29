// src/pages/WalletTopupPage.js

import React, { useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

import "../css/TossPayment.css";

const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;


export default function WalletTopupPage() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState();

    const handleQuickAdd = (delta) => {
        setAmount((prev) => {
            const current = Number(prev || 0);
            const next = current + delta;
            return next.toString();
        });
    };

    const parsedAmount = Number(amount || 0);
    const handleResetAmount = () => {
        setAmount(""); // -> parsedAmount는 0으로 됨
    };

    const handleRequestPayment = async () => {
        try {
            const tossPayments = await loadTossPayments(clientKey);

            await tossPayments.requestPayment("카드", {
                amount,
                orderId: nanoid(),
                orderName: `무한루프 페이 충전 (${amount.toLocaleString()}원)`,
                successUrl: `${window.location.origin}/wallet/topup/success`,
                failUrl: `${window.location.origin}/wallet/topup/fail`,
                customerName: "테스트유저",
                customerEmail: "",
            });
        } catch (err) {
            if (err.code === "USER_CANCEL") {
                alert("결제가 취소되었습니다.");
                navigate(`/profile`, { replace: true });
                return;

            }
            alert("결제 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell">
                {/* 토스 샘플 CSS 구조 그대로 사용 */}
                <div className="wrapper w-100">
                    <div className="max-w-540 w-100 wallet-topup-card">
                        <h1 className="wallet-topup-title">무한루프 페이 충전</h1>

                        {/* 현재 선택 금액 표시 */}
                        <div className="wallet-topup-amount-display">
                            <span className="label">충전 예정 금액</span>
                            <span className="value">
                            {parsedAmount.toLocaleString()}원
                        </span>
                        </div>



                        {/* 금액 입력 */}
                        <div className="w-100 wallet-topup-input-group">
                            <label className="wallet-label">직접 입력</label>
                            <div className="Wallet_div_label">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    className="wallet-input"
                                    placeholder="금액을 입력하세요"
                                    value={amount}
                                    onKeyDown={(e) => {
                                        // e, E, +, -, . 입력 막기
                                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => {
                                        const v = e.target.value;

                                        // 다 지웠을 때
                                        if (v === '') {
                                            setAmount('');
                                            return;
                                        }

                                        // 숫자만 (복붙 방어)
                                        if (!/^\d+$/.test(v)) {
                                            return;
                                        }

                                        // 🔹 첫 글자가 0인 값은 허용 안 함
                                        // 1) 한 글자인데 0인 경우 → 입력 안 되게
                                        if (v.length === 1 && v === '0') {
                                            return;
                                        }

                                        // 2) 여러 자리인데 0으로 시작하는 경우 → 앞의 0 제거해서 저장
                                        if (v.length > 1 && v.startsWith('0')) {
                                            const normalized = String(parseInt(v, 10)); // "000123" -> "123"
                                            setAmount(normalized);
                                            return;
                                        }

                                        // 정상 숫자
                                        setAmount(v);
                                    }}
                                />

                            </div>


                            <div className="Wallet_div_reset_btn">
                                <button
                                    type="button"
                                    className="wallet-reset-btn"
                                    onClick={handleResetAmount}
                                    disabled={parsedAmount === 0}
                                >
                                    초기화
                                </button>
                            </div>

                        </div>

                        {/* 빠른 충전 버튼 */}
                        <div className="wallet-quick-section">
                            <span className="wallet-label">빠른 충전</span>
                            <div className="wallet-quick-grid">
                                <button
                                    type="button"
                                    className="wallet-quick-btn"
                                    onClick={() => handleQuickAdd(1000)}
                                >
                                    +1,000원
                                </button>
                                <button
                                    type="button"
                                    className="wallet-quick-btn"
                                    onClick={() => handleQuickAdd(5000)}
                                >
                                    +5,000원
                                </button>
                                <button
                                    type="button"
                                    className="wallet-quick-btn"
                                    onClick={() => handleQuickAdd(10000)}
                                >
                                    +10,000원
                                </button>
                                <button
                                    type="button"
                                    className="wallet-quick-btn"
                                    onClick={() => handleQuickAdd(50000)}
                                >
                                    +50,000원
                                </button>
                                <button
                                    type="button"
                                    className="wallet-quick-btn"
                                    onClick={() => handleQuickAdd(100000)}
                                >
                                    +100,000원
                                </button>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="Wallet_div_payment-request-button">
                            <button
                                id="payment-request-button"
                                className="btn primary"
                                onClick={handleRequestPayment}
                                disabled={parsedAmount <= 0}
                            >
                                {parsedAmount > 0
                                    ? `${parsedAmount.toLocaleString()}원 결제하기`
                                    : "결제하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
