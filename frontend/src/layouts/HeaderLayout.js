// src/layouts/HeaderLayout.js
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";

import BottomNav from "../components/BottomNav";

export default function HeaderLayout({ title, left, right, isBack }) {

    const navigate = useNavigate();

    // 왼쪽 영역 클릭했을 때 동작
    const handleLeftClick = () => {
        if (isBack) {
            navigate(-1); // ✅ 이전 페이지로 이동
        }
    };

    // isBack 이 true면 왼쪽 내용을 버튼으로 감싸서 클릭 가능하게
    const leftContent = isBack ? (
        <button
            type="button"
            className="Header-left-button"
            onClick={handleLeftClick}
            style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
            }}
        >
            {left}
        </button>
    ) : (
        left
    );


    return (
        <>
            {/* 공통 헤더 */}
            <Header
                title={title}
                left={leftContent}
                right={right}
            />
            <Outlet />       {/* 페이지 본문 */}

        </>
    );
}
