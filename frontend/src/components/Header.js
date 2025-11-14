// src/components/Header.js

import "../css/Header.css";

export default function Header({ title, left, right }){

    return (
        <header className="App-Header">
            <div className="Header-left">헤더 좌측</div>
            <div className="Header-title">헤더 중간</div>
            <div className="Header-right">헤더 우측</div>
        </header>
    );
}
