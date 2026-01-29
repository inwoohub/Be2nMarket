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
import PostWritePage from "./pages/PostWritePage";
import ReviewWritePage from "./pages/ReviewWritePage";
import WalletTopupPage from "./pages/WalletTopupPage";
import PayTopupSuccessPage from "./pages/PayTopupSuccessPage";
import PayTopupFailPage from "./pages/PayTopupFailPage";
import WalletWithdrawPage from "./pages/WalletWithdrawPage";
import AdminWithdrawListPage from "./pages/AdminWithdrawListPage";
import SetLocationPage from "./pages/SetLocationPage";
import { getBackendBaseUrl } from "./utils/backend";


//css
import "./css/App.css";

function LocationGuard({ auth }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!auth.loading && auth.user && auth.user.auth === "oauth2") {
            if (!auth.user.hasLocation && location.pathname !== "/set-location") {
                navigate("/set-location");
            }
        }
    }, [auth, navigate, location]);

    return null;
}

function ExternalRedirect({ to }) {
    useEffect(() => {
        window.location.replace(to);
    }, [to]);

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
                <LocationGuard auth={auth} />

                <Routes>
                    {/* OAuth2 로그인 시작 URL을 프론트 라우팅으로 타지 않게 강제 리다이렉트 */}
                    <Route
                        path="/oauth2/authorization/kakao"
                        element={<ExternalRedirect to={`${getBackendBaseUrl()}/oauth2/authorization/kakao`} />}
                    />

                    <Route path="/wallet/topup/success" element={<PayTopupSuccessPage />} />
                    <Route path="/wallet/topup/fail" element={<PayTopupFailPage />} />

                    <Route path="/set-location" element={<SetLocationPage />} />

                    <Route path="/posts/write" element={<PostWritePage />} />

                    <Route path="/reviews/write/:postId/:partnerId" element={<ReviewWritePage />} />

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
                                <Route path="/main" element={<MainPage />} />
                            </Route>
                        </Route>

                        {/* 게시글 상세 페이지 */}
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
                            <Route path="/posts/:postId" element={<PostDetailPage />} />
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
                                <Route path="/chat/list" element={<ChatListPage />} />
                                <Route path="/chat" element={<ChatListPage />} />
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
                            <Route element={<WithBottomNav />}>
                                <Route path="/chat/:roomId" element={<ChatPage />} />
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
                                <Route path="/profile" element={<ProfilePage />} />
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
                                <Route path="/wallet/topup" element={<WalletTopupPage />} />
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
                                <Route path="/wallet/withdraw" element={<WalletWithdrawPage />} />
                            </Route>
                        </Route>

                        {/* 관리자 승인 페이지*/}
                        <Route path="/admin/withdraw-requests" element={<AdminWithdrawListPage />} />

                    </Route>

                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
