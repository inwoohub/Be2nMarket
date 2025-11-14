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

                        {/* 헤더가 필요한 페이지 그룹 */}
                        <Route element={<HeaderLayout />}>
                            {/* 헤더만 있고 바텀네브 없는 페이지가 필요하면 여기서 바로 Route 작성 */}

                            {/* 헤더 + 바텀네브 둘 다 필요한 페이지 그룹 */}
                            <Route element={<WithBottomNav />}>
                                <Route path="/main/:userId" element={<MainPage />} />
                            </Route>

                            <Route element={<WithBottomNav />}>
                                <Route path="/chat/:userId" element={<ChatPage />} />
                            </Route>

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
