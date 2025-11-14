// src/layouts/HeaderLayout.js
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function HeaderLayout() {
    const [headerConfig, setHeaderConfig] = useState({
        title: "",
        left: null,
        right: null,
    });

    return (
        <>
            {/* 공통 헤더 */}
            <Header
                title={headerConfig.title}
                left={headerConfig.left}
                right={headerConfig.right}
            />
            <Outlet />       {/* 페이지 본문 */}

        </>
    );
}
