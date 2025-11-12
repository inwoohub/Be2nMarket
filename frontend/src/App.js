import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import WithBottomNav from "./layouts/WithBottomNav";

// 페이지들
import Index from "./pages/Index";
import MainPage from "./pages/MainPage";
// import Login from "./pages/Login";
// import Products from "./pages/Products";
// import NotFound from "./pages/NotFound";

function App() {
    return (
        <Router>
            <Routes>
                {/* 👇 이 Route가 레이아웃이며, 안쪽 모든 페이지에 SnowFX가 적용됨 */}
                {/*<Route>*/}
                <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route element={<WithBottomNav />}>
                        <Route path="/main" element={<MainPage />} />
                    </Route>
                    {/* 필요한 페이지들을 추가 */}
                    {/* <Route path="/login" element={<Login />} /> */}
                    {/* <Route path="/products" element={<Products />} /> */}
                    {/* 마지막 캐치올 */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
