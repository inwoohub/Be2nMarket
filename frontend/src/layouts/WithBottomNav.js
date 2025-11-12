// src/layouts/WithBottomNav.jsx
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function WithBottomNav() {
    return (
        <>
            <Outlet />       {/* 페이지 본문 */}
            <BottomNav />    {/* 하단 네비 (이 그룹에만 표시) */}
        </>
    );
}
