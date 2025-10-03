// React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
// CSS
import "./App.css";
// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
// Components
import Footer from "./components/Footer";


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
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
