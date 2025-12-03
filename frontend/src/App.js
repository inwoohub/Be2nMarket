import React, {useContext, useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Layout from "./layouts/Layout";
import HeaderLayout from "./layouts/HeaderLayout";
import WithBottomNav from "./layouts/WithBottomNav";

// 페이지들
import Index from "./pages/Index";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import WalletTopupPage from "./pages/WalletTopupPage";
import PayTopupSuccessPage from "./pages/PayTopupSuccessPage";
import PayTopupFailPage from "./pages/PayTopupFailPage";
import WalletWithdrawPage from "./pages/WalletWithdrawPage";
import AdminWithdrawListPage from "./pages/AdminWithdrawListPage";

//css
import "./css/App.css";

function App() {

    const [auth, setAuth] = useState({ loading: true, user: null });

    useEffect(() => {
        fetch("/api/session/me", {
            credentials: "include", // 세션 쿠키 보내기
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
                <Routes>

                    {/* 🔹 결제 관련 페이지들: Layout / Header / BottomNav 적용 ❌ */}

                    <Route path="/wallet/topup/success" element={<PayTopupSuccessPage />} />
                    <Route path="/wallet/topup/fail" element={<PayTopupFailPage />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Index />} />



                        {/* 메인 페이지: 헤더 + 바텀네브 */}
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

                        {/* 채팅 페이지: 헤더 + 바텀네브 */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="채팅"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon"  alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right="검색"
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/chat/:userId" element={<ChatPage />} />
                            </Route>
                        </Route>

                        {/* ⭐ 프로필 페이지: 헤더 + 바텀네브 (여기 따로 설정) */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="프로필"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon"  alt="뒤로가기" src="/backWhite.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/profile/:userId" element={<ProfilePage />} />
                            </Route>
                        </Route>

                        {/* ⭐ 충전 페이지: 헤더 + 바텀네브 (여기 따로 설정) */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="충전하기"
                                    isBack={true}
                                    left={
                                        <img className="Header-icon"  alt="뒤로가기" src="/backWhite.png" />
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
