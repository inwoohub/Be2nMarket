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
import ChatListPage from "./pages/ChatListPage";
import PostDetailPage from "./pages/PostDetailPage"; 
import WalletTopupPage from "./pages/WalletTopupPage";
import PayTopupSuccessPage from "./pages/PayTopupSuccessPage";
import PayTopupFailPage from "./pages/PayTopupFailPage";

//css
import "./css/App.css";

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
                <Routes>
                    <Route path="/wallet/topup/success" element={<PayTopupSuccessPage />} />
                    <Route path="/wallet/topup/fail" element={<PayTopupFailPage />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<Index />} />

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

                    </Route>

                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;