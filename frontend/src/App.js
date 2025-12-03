// import React, {useContext, useEffect, useState} from "react";
import React, { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        // [디버깅용] 콘솔에 현재 유저 정보를 찍어봅니다.
        // F12 -> Console 탭에서 확인해보세요. hasLocation이 true/false로 잘 나오나요?
        if (auth.user) {
            console.log("현재 로그인 유저 정보:", auth.user);
        }

        if (!auth.loading && auth.user && auth.user.auth === "oauth2") {

            // 주의: 백엔드 SessionController를 수정하지 않았다면 hasLocation이 undefined입니다.
            // undefined === false는 false이므로 작동하지 않습니다.
            // 확실하게 체크하기 위해 !auth.user.hasLocation 조건으로 변경합니다.

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

                        {/* 채팅 페이지 */}
                        {/* 게시글 상세 페이지 */}
                        {/* 헤더만 있고 바텀네비는 없는 레이아웃 사용 (채팅 버튼이 하단에 고정되므로) */}
                        <Route
                            element={
                                <HeaderLayout
                                    title="" // 상세 페이지는 보통 타이틀 없이 투명하거나 뒤로가기만 있음
                                    isBack={true}
                                    left={
                                        <img className="Header-icon" alt="뒤로가기" src="/backBlack.png" />
                                    }
                                    right=""
                                />
                            }
                        >
                            <Route path="/posts/:postId/:userId" element={<PostDetailPage />} />
                        </Route>

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
