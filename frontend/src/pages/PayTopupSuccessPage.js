// src/pages/PayTopupSuccessPage.js
import React, { useMemo, useState } from "react";
import "../css/TossPayment.css";

export default function PayTopupSuccessPage() {
    const searchParams = useMemo(
        () => new URLSearchParams(window.location.search),
        []
    );

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        try {
            setConfirming(true);
            setError(null);

            // 🔴 여기 URL은 스프링에서 구현할 승인 API에 맞춰서 바꿔줘
            const res = await fetch("/api/wallet/topup/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    paymentKey,
                    orderId,
                    amount: Number(amount),
                }),
            });

            if (!res.ok) throw new Error("서버 결제 승인 실패");
            await res.json(); // 필요하면 데이터 사용

            setConfirmed(true);
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setConfirming(false);
        }
    };

    const profilePath = orderId ? `/profile/${orderId}` : "/login";

    return (
        <div className="app-shell">
            <div className="sub-app-shell">
                <div className="wrapper w-100">
                    {/* 1단계: 승인 전 화면 */}
                    <div
                        className="flex-column align-center confirm-loading w-100 max-w-540"
                        style={{ display: confirmed ? "none" : "flex" }}
                    >
                        <div className="flex-column align-center">
                            <img
                                src="https://static.toss.im/lotties/loading-spot-apng.png"
                                width="120"
                                height="120"
                                alt="loading"
                            />
                            <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
                            <h4 className="text-center description">
                                결제 승인하고 완료해보세요.
                            </h4>
                            {error && (
                                <p className="description color-grey">오류: {error}</p>
                            )}
                        </div>
                        <div className="div_confirmPaymentButton">
                            <button
                                id="confirmPaymentButton"
                                className="btn primary w-100"
                                onClick={handleConfirm}
                                disabled={confirming}
                            >
                                {confirming ? "승인 중..." : "결제 승인하기"}
                            </button>
                        </div>
                    </div>

                    {/* 2단계: 승인 완료 화면 */}
                    <div
                        className="flex-column align-center confirm-success w-100 max-w-540"
                        style={{ display: confirmed ? "flex" : "none" }}
                    >
                        <img
                            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
                            width="120"
                            height="120"
                            alt="success"
                        />
                        <h2 className="title">결제를 완료했어요</h2>

                        <div className="response-section w-100">
                            <div className="flex justify-between">
                                <span className="response-label">결제 금액</span>
                                <span id="amount" className="response-text">
                          {Number(amount).toLocaleString()}원
                        </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="response-label">주문번호</span>
                                <span id="orderId" className="response-text">
                          {orderId}
                        </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="response-label">paymentKey</span>
                                <span id="paymentKey" className="response-text">
                          {paymentKey}
                        </span>
                            </div>
                        </div>

                        <div className="div_confirmPaymentButton">
                            <a className="btn primary w-100" href={profilePath}>
                                홈으로 돌아가기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
