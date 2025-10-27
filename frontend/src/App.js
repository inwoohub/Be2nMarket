import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 각 페이지 컴포넌트 import
import Index from "./pages/Index";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Index />} />
            </Routes>
        </Router>
    );
}


export default App;
