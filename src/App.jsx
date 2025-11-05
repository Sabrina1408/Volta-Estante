import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth, AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha/RecuperarSenha";
import Perfil from "./pages/Perfil/Perfil";
import Estoque from "./pages/Estoque/Estoque";
import Dashboard from "./pages/Dashboard/Dashboard";
import Search from "./pages/Search/Search";
import Vendas from "./pages/Vendas/Vendas";
import Logs from "./pages/Logs/Logs";
import Trending from "./pages/Trending/Trending";

import Footer from "./components/Footer/Footer";
import NavBar from "./components/NavBar/NavBar";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/perfil" replace />}
      />
      <Route
        path="/cadastro"
        element={!user ? <Cadastro /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/recuperarSenha"
        element={!user ? <RecuperarSenha /> : <Navigate to="/perfil" replace />}
      />
      <Route
        path="/perfil"
        element={user ? <Perfil /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/estoque"
        element={user ? <Estoque /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/search"
        element={user ? <Search /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/vendas"
        element={user ? <Vendas /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/logs"
        element={user ? <Logs /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/trending"
        element={user ? <Trending /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <NavBar />
          <div className="container">
            <AppRoutes />
          </div>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;