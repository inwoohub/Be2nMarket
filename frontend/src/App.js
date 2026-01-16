import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Layout from "./layouts/Layout";
import HeaderLayout from "./layouts/HeaderLayout";
import WithBottomNav from "./layouts/WithBottomNav";

// 페이지들
import Index from "./pages/Index";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import ChatListPage from "./pages/ChatListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostWritePage from "./pages/PostWritePage"; // [추가됨] 게시글 작성 페이지 임포트
import ReviewWritePage from "./pages/ReviewWritePage";
import WalletTopupPage from "./pages/WalletTopupPage";
import PayTopupSuccessPage from "./pages/PayTopupSuccessPage";
import PayTopupFailPage from "./pages/PayTopupFailPage";
import WalletWithdrawPage from "./pages/WalletWithdrawPage";
import AdminWithdrawListPage from "./pages/AdminWithdrawListPage";
import SetLocationPage from "./pages/SetLocationPage";


//css
import "./css/App.css";

// 🔹 위치 감시 컴포넌트
function LocationGuard({ auth }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (auth.user) {
            console.log("현재 로그인 유저 정보:", auth.user);
        }

        if (!auth.loading && auth.user && auth.user.auth === "oauth2") {
            // "위치 정보가 없고(false 혹은 undefined)" AND "현재 설정 페이지가 아니라면"
            if (!auth.user.hasLocation && location.pathname !== "/set-location") {
                console.log("위치 정보 없음 감지! 설정 페이지로 이동합니다.");
                navigate("/set-location");
            }
        }
    }, [auth, navigate, location]);

    return null;
}

function App() {

    const [auth, setAuth] = useState({ loading: true, user: null });

    useEffect(() => {
        fetch("/api/session/me", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.auth === "oauth2") {
                    setAuth({ loading: false, user: data });
                } else {
                    setAuth({ loading: false, user: null });
                }
            })
            .catch(() => {
                setAuth({ loading: false, user: null });
            });
    }, []);

    return (
        <AuthContext.Provider value={auth}>
            <Router>
                {/* LocationGuard가 실시간으로 위치 설정을 감시합니다 */}
                <LocationGuard auth={auth} />

                <Routes>
                    <Route path="/wallet/topup/success" element={<PayTopupSuccessPage />} />
                    <Route path="/wallet/topup/fail" element={<PayTopupFailPage />} />

                    {/* 위치 설정 페이지 */}
                    <Route path="/set-location" element={<SetLocationPage />} />

                    {/* [추가됨] 게시글 작성 페이지 */}
                    {/* 전체 화면을 덮기 위해 Layout 밖에 배치합니다 */}
                    <Route path="/posts/write/:userId" element={<PostWritePage />} />

                    {/* ⭐⭐⭐ [신규 추가] 거래 후기 작성 페이지 ⭐⭐⭐ */}
                    {/* 전체 화면을 덮기 위해 Layout 밖에 배치 (HeaderLayout, BottomNav 없음) */}
                    <Route path="/reviews/write/:userId/:postId/:partnerId" element={<ReviewWritePage />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Index />} />

                        {/* 메인 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="메인"
                                    left="로고"
                                    right="알림"
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/main/:userId" element={<MainPage />} />
                            </Route>
                        </Route>

                        {/* [수정됨] 게시글 상세 페이지 */}
                        {/* 검정 테마 오류 해결: backBlack.png -> backWhite.png */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="" 
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route path="/posts/:postId/:userId" element={<PostDetailPage />} />
                        </Route>

                        {/* 채팅 목록 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="채팅 목록"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/chat/list/:userId" element={<ChatListPage />} />
                                <Route path="/chat/:userId" element={<ChatListPage />} />
                            </Route>
                        </Route>

                        {/* 개별 채팅방 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="채팅"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right="검색"
                                />
                            }
                        >
                            {/* 채팅방 내부에서는 보통 하단 탭바를 숨깁니다 (입력창 때문). 필요시 WithBottomNav 제거 가능 */}
                            <Route element={<WithBottomNav />}>
                                <Route path="/chat/:roomId/:userId" element={<ChatPage />} />
                            </Route>
                        </Route>

                        {/* 프로필 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="프로필"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/profile/:userId" element={<ProfilePage />} />
                            </Route>
                        </Route>

                        {/* 충전 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="충전하기"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/wallet/topup/:userId" element={<WalletTopupPage />} />
                            </Route>
                        </Route>

                        {/* 출금 페이지 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="출금하기"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon"  alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/wallet/withdraw/:userId" element={<WalletWithdrawPage />} />
                            </Route>
                        </Route>

                        {/* 관리자 승인 페이지*/}
                        <Route path="/admin/withdraw-requests" element={<AdminWithdrawListPage />} />

                        {/* 라우터 구분선 */}
                    </Route>

                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;