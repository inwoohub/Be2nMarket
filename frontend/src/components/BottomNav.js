// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import "../css/BottomNav.css";

export default function BottomNav() {

    const [hoveredTab, setHoveredTab] = useState(null);
    const {loading,user } = useContext(AuthContext);



    if (loading) return null;

    // 경로 설정 및 로그인 풀리면 로그인 페이지
    const userId = user?.userId;
    const mainPath = userId ? `/main/${userId}` : "/";
    const chatPath = userId ? `/chat/${userId}` : "/";
    const profilePath = userId ? `/profile/${userId}` : "/";



    return (
        <nav className="BottomNav" role="navigation" aria-label="Tab bar">
            {/* 메인 탭 */}
            <NavLink
                to={mainPath}
                end
                className={({ isActive }) =>
                    `BottomNav__item ${isActive ? "active" : ""}`
                }
                onMouseEnter={() => setHoveredTab("main")}
                onMouseLeave={() => setHoveredTab(null)}
            >

            {({ isActive }) => (
                    <img
                        src={
                            isActive || hoveredTab === "main"
                            ? "/homeBlue.png" // 활성 / hover
                            : "/home.png"        // 기본
                        }
                        alt="메인"
                        className="BottomNav_icon"
                    />
                )}
            </NavLink>

            {/* 채팅 탭 */}
            <NavLink
                to={chatPath}
                end
                className={({ isActive }) =>
                    `BottomNav__item ${isActive ? "active" : ""}`
                }
                onMouseEnter={() => setHoveredTab("chat")}
                onMouseLeave={() => setHoveredTab(null)}
            >
                {({ isActive }) => (
                    <img
                        src={
                            isActive || hoveredTab === "chat"
                                ? "/chatBlue.png" // 활성 / hover
                                : "/chat.png"        // 기본
                        }
                        alt="채팅"
                        className="BottomNav_icon"
                    />
                )}
            </NavLink>

            {/* 마이 탭 */}
            <NavLink
                to={profilePath}
                end
                className={({ isActive }) =>
                    `BottomNav__item ${isActive ? "active" : ""}`
                }
                onMouseEnter={() => setHoveredTab("profile")}
                onMouseLeave={() => setHoveredTab(null)}
            >

                {({ isActive }) => (
                    <img
                        src={
                            isActive || hoveredTab === "profile"
                                ? "/userBlue.png" // 활성 / hover
                                : "/user.png"        // 기본
                        }
                        alt="프로필"
                        className="BottomNav_icon"
                    />
                )}
            </NavLink>
        </nav>
    );
}
