// src/pages/AdminWithdrawListPage.js

import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import "../css/AdminWithdrawListPage.css";

export default function AdminWithdrawListPage() {
    const auth = useContext(AuthContext);
    const user = auth.user;
    const userId = user?.userId;

    const [status, setStatus] = useState("PENDING");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectTargetId, setRejectTargetId] = useState(null)

    // 리스트 조회
    const fetchList = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            if (status && status !== "ALL") {
                params.append("status", status);
            }
            params.append("page", page);
            params.append("size", size);

            const res = await fetch(`/api/admin/withdraw-requests?${params.toString()}`, {
                credentials: "include",
            });

            // 권한 관련 처리
            if (!res.ok) {
                alert("관리자만 접근할 수 있는 페이지입니다.");
                window.location.href = `/main/${userId}`;
                return;
            }

            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("출금 요청 목록 조회 에러", err);
            setError(err.message || "목록 조회 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // userId 로딩
    useEffect(() => {
        if (auth.loading) return;
        if (!auth.user) {
            alert("로그인이 필요합니다.");
            window.location.href = "/";
            return;
        }
        fetchList();
    }, [auth, status, page, size]);

    // 승인 처리
    const handleApprove = async (id) => {
        if (!window.confirm("정말 이 출금 요청을 승인하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/admin/withdraw-requests/${id}/approve`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("출금 승인 실패");
            }

            alert("출금 요청이 승인되었습니다.\n(실제 계좌 이체는 별도의 작업으로 처리해야 합니다.)");
            fetchList();
        } catch (err) {
            console.error("승인 에러", err);
            alert(err.message || "승인 처리 중 오류가 발생했습니다.");
        }
    };

    // 거절 모달 열기
    const openRejectModal = (id) => {
        setRejectTargetId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    // 거절 처리
    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            alert("거절 사유를 입력해주세요.");
            return;
        }

        try {
            const res = await fetch(`/api/admin/withdraw-requests/${rejectTargetId}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ reason: rejectReason.trim() }),
            });

            if (!res.ok) {
                throw new Error("출금 거절 실패");
            }

            alert("출금 요청이 거절되었습니다.");
            setRejectModalOpen(false);
            setRejectTargetId(null);
            setRejectReason("");

            fetchList();
        } catch (err) {
            console.error("거절 에러", err);
            alert(err.message || "거절 처리 중 오류가 발생했습니다.");
        }
    };

    const handleChangeStatus = (newStatus) => {
        setStatus(newStatus);
        setPage(0);
    };

    const totalPages = data?.totalPages ?? 0;

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

    function getBankName(bankCode) {
        const bank = BANK_OPTIONS.find((b) => b.code === bankCode);
        return bank ? bank.name : bankCode; // 못 찾으면 코드 그대로
    }


    return (
        <div className="Admindraw_page">
            <div className="Admindraw_container">
                {/* 헤더 */}
                <header className="Admindraw_header">
                    <div>
                        <h1 className="Admindraw_title">출금 요청 관리</h1>
                        <p className="Admindraw_subtitle">
                            사용자 출금 요청을 승인하거나 거절하고, 정산 현황을 관리하는 페이지입니다.
                            <br />
                            실제 계좌 이체는 별도의 인터넷뱅킹/기업뱅킹을 통해 처리해야 합니다.
                        </p>
                    </div>
                </header>

                {/* 필터/옵션 영역 */}
                <section className="Admindraw_toolbar">
                    <div className="Admindraw_filterGroup">
                        <button
                            type="button"
                            className={`Admindraw_filterBtn ${status === "PENDING" ? "Admindraw_filterBtn--active" : ""}`}
                            onClick={() => handleChangeStatus("PENDING")}
                        >
                            대기중
                        </button>
                        <button
                            type="button"
                            className={`Admindraw_filterBtn ${status === "COMPLETED" ? "Admindraw_filterBtn--active" : ""}`}
                            onClick={() => handleChangeStatus("COMPLETED")}
                        >
                            완료
                        </button>
                        <button
                            type="button"
                            className={`Admindraw_filterBtn ${status === "REJECTED" ? "Admindraw_filterBtn--active" : ""}`}
                            onClick={() => handleChangeStatus("REJECTED")}
                        >
                            거절
                        </button>
                        <button
                            type="button"
                            className={`Admindraw_filterBtn ${status === "ALL" ? "Admindraw_filterBtn--active" : ""}`}
                            onClick={() => handleChangeStatus("ALL")}
                        >
                            전체
                        </button>
                    </div>

                    <div className="Admindraw_pageSize">
                        <span>페이지당 개수</span>
                        <select
                            value={size}
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </section>

                {/* 에러 */}
                {error && (
                    <div className="Admindraw_alert Admindraw_alert--error">
                        {error}
                    </div>
                )}

                {/* 로딩 */}
                {loading && (
                    <div className="Admindraw_loading">
                        목록을 불러오는 중입니다...
                    </div>
                )}

                {/* 리스트 */}
                {!loading && data && data.content && data.content.length === 0 && (
                    <div className="Admindraw_empty">
                        해당 상태의 출금 요청이 없습니다.
                    </div>
                )}

                {!loading && data && data.content && data.content.length > 0 && (
                    <section className="Admindraw_list">
                        {data.content.map((item) => {
                            const {
                                id,
                                amount,
                                status: itemStatus,
                                userId,
                                userNickname,
                                bankCode,
                                accountNumber,
                                accountHolder,
                                requestedAt,
                                completedAt,
                                rejectedAt,
                                rejectReason: itemRejectReason,
                            } = item;

                            return (
                                <article key={id} className="Admindraw_card">
                                    <div className="Admindraw_cardHeader">
                                        <div className="Admindraw_userInfo">
                                            <span className="Admindraw_userName">
                                                {userNickname || `USER#${userId}`}
                                            </span>
                                            <span className="Admindraw_userId">
                                                ID: {userId}
                                            </span>
                                        </div>
                                        <div className="Admindraw_amount">
                                            {amount?.toLocaleString()}원
                                        </div>
                                    </div>

                                    <div className="Admindraw_cardBody">
                                        <div className="Admindraw_line">
                                            <span className="Admindraw_label">은행</span>
                                            <span className="Admindraw_value">
                                                {getBankName(bankCode)} ({bankCode})
                                            </span>
                                        </div>

                                        <div className="Admindraw_line">
                                            <span className="Admindraw_label">계좌번호</span>
                                            <span className="Admindraw_value">{accountNumber}</span>
                                        </div>
                                        <div className="Admindraw_line">
                                            <span className="Admindraw_label">예금주</span>
                                            <span className="Admindraw_value">{accountHolder}</span>
                                        </div>

                                        <div className="Admindraw_line Admindraw_line--meta">
                                            <span className="Admindraw_label">요청 시각</span>
                                            <span className="Admindraw_value">{requestedAt || "-"}</span>
                                        </div>

                                        {itemStatus === "COMPLETED" && (
                                            <div className="Admindraw_line Admindraw_line--meta">
                                                <span className="Admindraw_label">완료 시각</span>
                                                <span className="Admindraw_value">{completedAt || "-"}</span>
                                            </div>
                                        )}

                                        {itemStatus === "REJECTED" && (
                                            <>
                                                <div className="Admindraw_line Admindraw_line--meta">
                                                    <span className="Admindraw_label">거절 시각</span>
                                                    <span className="Admindraw_value">{rejectedAt || "-"}</span>
                                                </div>
                                                <div className="Admindraw_line Admindraw_line--meta">
                                                    <span className="Admindraw_label">거절 사유</span>
                                                    <span className="Admindraw_value">
                                                        {itemRejectReason || "-"}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="Admindraw_cardFooter">
                                        <span
                                            className={`Admindraw_statusBadge Admindraw_statusBadge--${itemStatus.toLowerCase()}`}
                                        >
                                            {itemStatus}
                                        </span>

                                        {itemStatus === "PENDING" && (
                                            <div className="Admindraw_actions">
                                                <button
                                                    type="button"
                                                    className="Admindraw_btn Admindraw_btn--primary"
                                                    onClick={() => handleApprove(id)}
                                                >
                                                    승인
                                                </button>
                                                <button
                                                    type="button"
                                                    className="Admindraw_btn Admindraw_btn--ghost"
                                                    onClick={() => openRejectModal(id)}
                                                >
                                                    거절
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                {/* 페이지네이션 */}
                {data && totalPages > 1 && (
                    <footer className="Admindraw_pagination">
                        <button
                            type="button"
                            className="Admindraw_btn Admindraw_btn--ghost"
                            disabled={page === 0}
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        >
                            이전
                        </button>
                        <span className="Admindraw_pageInfo">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            type="button"
                            className="Admindraw_btn Admindraw_btn--ghost"
                            disabled={page + 1 >= totalPages}
                            onClick={() =>
                                setPage((p) => (p + 1 < totalPages ? p + 1 : p))
                            }
                        >
                            다음
                        </button>
                    </footer>
                )}
            </div>

            {/* 거절 모달 */}
            {rejectModalOpen && (
                <div className="Admindraw_modalBackdrop">
                    <div className="Admindraw_modal">
                        <h3 className="Admindraw_modalTitle">출금 요청 거절</h3>
                        <p className="Admindraw_modalText">
                            사용자에게 보여줄 거절 사유를 입력해주세요.
                        </p>
                        <textarea
                            rows={3}
                            className="Admindraw_modalTextarea"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="Admindraw_modalActions">
                            <button
                                type="button"
                                className="Admindraw_btn Admindraw_btn--ghost"
                                onClick={() => setRejectModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="Admindraw_btn Admindraw_btn--primary"
                                onClick={handleRejectSubmit}
                            >
                                거절 확정
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
