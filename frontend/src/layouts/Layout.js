// src/layouts/Layout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SnowFX from "../components/SnowFX";

export default function Layout() {
    const location = useLocation();
    const showSnow = location.pathname === "/"; // ✅ Index 페이지에서만 눈

    return (
        <>
            {showSnow && <SnowFX />}  {/* / 일 때만 눈 */}
            <Outlet />
        </>
    );
}
