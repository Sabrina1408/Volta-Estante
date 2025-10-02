// React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
// CSS
import "./App.css";
// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
