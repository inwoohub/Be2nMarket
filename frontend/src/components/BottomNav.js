// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import "../css/BottomNav.css";

export default function BottomNav() {
    return (
        <nav className="BottomNav" role="navigation" aria-label="Tab bar">
            {/*<NavLink to="/" end className="BottomNav__item">홈</NavLink>*/}
            {/*<NavLink to="/search" className="BottomNav__item">채팅</NavLink>*/}
            {/*<NavLink to="/my" className="BottomNav__item">나의 당근</NavLink>*/}
        </nav>
    );
}
