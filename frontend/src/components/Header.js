// src/components/Header.js

import "../css/Header.css";

export default function Header({ title, left, right }){

    return (
        <header className="App-Header">
            <div className="Header-left">{left}</div>
            <div className="Header-title">{title}</div>
            <div className="Header-right">{right}</div>
        </header>
    );
}
