// React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
// CSS
import "./App.css";
// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha/RecuperarSenha";
import Perfil from "./pages/Perfil/Perfil";
import Estoque from "./pages/Estoque/Estoque";
import Dashboard from "./pages/Dashboard/Dashboard";
import Search from "./pages/Search/Search";

// Components
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperarSenha" element={<RecuperarSenha />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
