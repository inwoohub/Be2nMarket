// src/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import SnowFX from "../components/SnowFX"; // 아래 2) 참고

export default function Layout() {
    return (
        <>
            <SnowFX />    {/* 👈 모든 페이지에 항상 보임 */}
            {/* 공통 헤더/푸터가 있으면 여기에 배치 */}
            <Outlet />    {/* 하위 라우트들이 여기 렌더링됨 */}
        </>
    );
}
