// src/pages/WalletWithdrawPage.js

import React, { useEffect, useState, useRef  } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../css/TossPayment.css";
import "../css/WalletWithdrawPage.css"

export default function WalletWithdrawPage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [amount, setAmount] = useState("");    // 출금 금액
    const [balance, setBalance] = useState(null); // 현재 지갑 잔액
    const [bankCode, setBankCode] = useState("004");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const parsedAmount = Number(amount || 0);
    const [isBankOpen, setIsBankOpen] = useState(false);
    const bankDropdownRef = useRef(null);

    // 잔액 조회
    useEffect(() => {
        fetch("/api/wallet/balance", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBalance(data.balance);
                } else {
                    console.error("잔액 조회 실패", data);
                    setError("잔액을 불러오지 못했습니다.");
                }
            })
            .catch((err) => {
                console.error("잔액 조회 에러", err);
                setError("잔액 조회 중 오류가 발생했습니다.");
            });
    }, []);

    // 빠른 금액 버튼 (충전 페이지와 동일 스타일)
    const handleQuickAdd = (delta) => {
        setAmount((prev) => {
            const current = Number(prev || 0);
            const next = current + delta;
            return next > 0 ? next.toString() : "";
        });
    };

    const handleResetAmount = () => {
        setAmount("");
    };

    const handleSubmitWithdraw = async () => {
        setError("");
        setSuccess("");

        const amt = Number(amount);

        if (!amt || amt <= 0) {
            setError("출금 금액을 올바르게 입력해주세요.");
            return;
        }

        if (balance != null && amt > balance) {
            setError("잔액보다 큰 금액은 출금할 수 없습니다.");
            return;
        }

        if (!bankCode) {
            setError("은행을 선택해주세요.");
            return;
        }

        if (!accountNumber.trim()) {
            setError("계좌번호를 입력해주세요.");
            return;
        }

        if (!accountHolder.trim()) {
            setError("예금주명을 입력해주세요.");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch("/api/wallet/withdraw-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    amount: amt,
                    bankCode,
                    accountNumber: accountNumber.trim(),
                    accountHolder: accountHolder.trim(),
                }),
            });

            if (!res.ok) {
                let msg = "출금 요청 실패";
                try {
                    const data = await res.json();
                    if (data.message) msg = data.message;
                } catch (e) {}
                throw new Error(msg);
            }

            const data = await res.json();

            setSuccess("출금 요청이 정상적으로 접수되었습니다.\n관리자 승인 후 입금이 진행됩니다.");
            setAmount("");

            // 화면에서 잔액 표기도 바로 줄여주기
            if (balance != null) {
                setBalance(balance - amt);
            }

            // ✅ 1초 뒤 프로필 페이지로 이동
            if (userId) {
                setTimeout(() => {
                    navigate(`/profile/${userId}`);
                }, 1000);
            } else {
                // 혹시 userId 없는 경우 대비 (선택)
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }

        } catch (err) {
            console.error("출금 요청 에러", err);
            setError(err.message || "출금 요청 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };


    const afterBalance =
        balance != null
            ? Math.max(balance - parsedAmount, 0)
            : 0;

    const BANK_OPTIONS = [
        { code: "004", name: "KB국민은행" },
        { code: "088", name: "신한은행" },
        { code: "020", name: "우리은행" },
        { code: "081", name: "하나은행" },
        { code: "090", name: "카카오뱅크" },
        { code: "089", name: "케이뱅크" },
        { code: "092", name: "토스뱅크" },
        { code: "003", name: "IBK기업은행" },
        { code: "002", name: "한국산업은행" },
        { code: "011", name: "NH농협은행" },
        { code: "012", name: "단위농협(지역농축협)" },
        { code: "007", name: "Sh수협은행" },
        { code: "030", name: "수협중앙회" },
        { code: "023", name: "SC제일은행" },
        { code: "027", name: "씨티은행" },
        { code: "039", name: "경남은행" },
        { code: "034", name: "광주은행" },
        { code: "032", name: "부산은행" },
        { code: "037", name: "전북은행" },
        { code: "035", name: "제주은행" },
        { code: "031", name: "iM뱅크(대구)" },
        { code: "045", name: "새마을금고" },
        { code: "048", name: "신협" },
        { code: "050", name: "저축은행중앙회" },
        { code: "071", name: "우체국예금보험" },
        { code: "064", name: "산림조합" },
        { code: "054", name: "홍콩상하이은행(HSBC)" },
    ];

    useEffect(() => {
        // 드롭다운 바깥 클릭 시 닫기
        const handleClickOutside = (event) => {
            if (!isBankOpen) return; // 안 열려있으면 신경 X

            if (
                bankDropdownRef.current &&
                !bankDropdownRef.current.contains(event.target)
            ) {
                setIsBankOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isBankOpen]);


    return (
        <div className="app-shell">
            <div className="sub-app-shell-draw">
                <div className="wrapperdraw">
                    <div className="max-w-540 w-100 wallet-topup-card">
                        {/* 제목 영역 */}
                        <h1 className="wallet-topup-title">무한루프 페이 출금</h1>

                        {/* 설명 */}
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                            내 상점에 적립된 금액을 본인 계좌로 출금 신청할 수 있어요.
                            <br />
                            관리자가 승인하면 실제 계좌로 입금됩니다.
                        </div>

                        {/* 잔액 표시 */}
                        <div className="wallet-topup-amount-display">
                            <span className="label">현재 잔액</span>
                            <span className="value">
                                {balance != null
                                    ? `${balance.toLocaleString()}원`
                                    : "불러오는 중..."}
                            </span>
                        </div>

                        {/* 출금 예정 금액 */}
                        <div className="wallet-topup-amount-display" style={{ marginTop: "8px" }}>
                            <span className="label">출금 요청 금액</span>
                            <span className="value">
                                {parsedAmount.toLocaleString()}원
                            </span>
                        </div>

                        <div className="wallet-topup-amount-display" style={{ marginTop: "8px" }}>
                            <span className="label">출금 후 잔액</span>
                            <span className="value">
                                {balance != null
                                    ? `${afterBalance.toLocaleString()}원`
                                    : "0원"}
                            </span>
                        </div>

                        {/* 금액 직접 입력 */}
                        <div className="w-100 wallet-topup-input-group">
                            <label className="wallet-label">직접 입력</label>
                            <div className="Wallet_div_label">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    className="wallet-input"
                                    placeholder="출금할 금액을 입력하세요"
                                    value={amount}
                                    onKeyDown={(e) => {
                                        // e, E, +, -, . 입력 막기 (충전 페이지와 동일)
                                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => {
                                        const v = e.target.value;

                                        // 다 지웠을 때
                                        if (v === "") {
                                            setAmount("");
                                            return;
                                        }

                                        // 숫자만 (복붙 방어)
                                        if (!/^\d+$/.test(v)) {
                                            return;
                                        }

                                        // 첫 글자가 0인 값은 허용 안 함
                                        if (v.length === 1 && v === "0") {
                                            return;
                                        }

                                        if (v.length > 1 && v.startsWith("0")) {
                                            const normalized = String(parseInt(v, 10));
                                            setAmount(normalized);
                                            return;
                                        }

                                        setAmount(v);
                                    }}
                                />
                            </div>

                            {/* 초기화 버튼 */}
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

                        {/* 빠른 출금 (충전처럼 금액 누적) */}
                        <div className="wallet-quick-section">
                            <span className="wallet-label">빠른 선택</span>
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

                        {/* 은행/계좌/예금주 입력 */}
                        <div className="w-100 wallet-topup-input-group" style={{ marginTop: "24px" }}>
                            <label className="wallet-label">은행</label>
                            <div ref={bankDropdownRef} style={{ position: "relative" }}>
                                <div
                                    className="bank-select-trigger"
                                    onClick={() => setIsBankOpen((prev) => !prev)}
                                >
                                <span>
                                    {
                                    BANK_OPTIONS.find((b) => b.code === bankCode)?.name ||
                                    "은행을 선택하세요"
                                    }
                                </span>
                                    <span className="bank-select-arrow">▾</span>
                                </div>

                                {isBankOpen && (
                                    <div className="bank-select-dropdown">
                                        {BANK_OPTIONS.map((bank) => (
                                            <button
                                                key={bank.code}
                                                type="button"
                                                className={
                                                    "bank-select-option" +
                                                    (bank.code === bankCode ? " bank-select-option--active" : "")
                                                }
                                                onClick={() => {
                                                    setBankCode(bank.code);
                                                    setIsBankOpen(false);
                                                }}
                                            >
                                                {bank.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-100 wallet-topup-input-group">
                            <label className="wallet-label">계좌번호</label>
                            <div className="Wallet_div_label">
                                <input
                                    type="text"
                                    className="wallet-input2"
                                    placeholder="계좌번호를 입력하세요"
                                    value={accountNumber}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        // 숫자 + 하이픈 정도만 허용 (원하면 더 제한해도 됨)
                                        if (/^[0-9-]*$/.test(v)) {
                                            setAccountNumber(v);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="w-100 wallet-topup-input-group">
                            <label className="wallet-label">예금주명</label>
                            <div className="Wallet_div_label">
                                <input
                                    type="text"
                                    className="wallet-input2"
                                    placeholder="예금주명을 입력하세요"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 에러/성공 메시지 */}
                        {error && (
                            <div style={{ color: "red", fontSize: "13px", marginTop: "8px" , marginBottom:"8px"}}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ color: "green", fontSize: "13px", marginTop: "8px", marginBottom:"8px", whiteSpace: "pre-line" }}>
                                {success}
                            </div>
                        )}

                        {/* 버튼 영역 */}
                        <div className="Wallet_div_payment-request-button">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => navigate(-1)}
                                disabled={submitting}
                                style={{ marginRight: "8px" }}
                            >
                                돌아가기
                            </button>
                            <button
                                id="withdraw-request-button"
                                className="btn primary"
                                onClick={handleSubmitWithdraw}
                                disabled={parsedAmount <= 0 || submitting}
                            >
                                {submitting
                                    ? "출금 요청 중..."
                                    : parsedAmount > 0
                                        ? `${parsedAmount.toLocaleString()}원 출금 요청`
                                        : "출금 요청하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
