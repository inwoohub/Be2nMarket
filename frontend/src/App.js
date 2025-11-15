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

//css
import "./css/App.css";

function App() {

    const [auth, setAuth] = useState({ loading: true, user: null });

    useEffect(() => {
        fetch("http://localhost:8080/api/session/me", {
            credentials: "include", // 세션 쿠키 보내기
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.auth === "session") {
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
                                    right="편집"
                                />
                            }
                        >
                            <Route element={<WithBottomNav />}>
                                <Route path="/profile/:userId" element={<ProfilePage />} />
                            </Route>
                        </Route>

                    </Route>

                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
