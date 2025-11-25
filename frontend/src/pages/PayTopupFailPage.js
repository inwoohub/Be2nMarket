// src/pages/PayTopupFailPage.js
import React, { useMemo } from "react";
import "../css/TossPayment.css";

export default function PayTopupFailPage() {
    const searchParams = useMemo(
        () => new URLSearchParams(window.location.search),
        []
    );
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    return (
        <div className="wrapper w-100">
            <div className="flex-column align-center w-100 max-w-540">
                <img
                    src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
                    width="160"
                    height="160"
                    alt="error"
                />
                <h2 className="title">결제를 실패했어요</h2>

                <div className="response-section w-100">
                    <div className="flex justify-between">
                        <span className="response-label">code</span>
                        <span id="error-code" className="response-text">
                          {errorCode}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="response-label">message</span>
                        <span id="error-message" className="response-text">
                          {errorMessage}
                        </span>
                    </div>
                </div>

                <div className="w-100 button-group">
                    <a
                        className="btn w-100"
                        href="/wallet/topup"
                    >
                        다시 테스트하기
                    </a>
                </div>
            </div>
        </div>
    );
}
