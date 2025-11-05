import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth, AuthProvider } from "./context/AuthContext";
import { useApi } from "./hooks/useApi";

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
import AlertModal from "./components/AlertModal/AlertModal";

function AppRoutes() {
  const { user, loading, logout } = useAuth();
  const { authFetch } = useApi();
  const navigate = useNavigate();
  const [deletedProfileModalOpen, setDeletedProfileModalOpen] = useState(false);

  const { error: profileError } = useQuery({
    queryKey: ["authProfileGuard", user?.uid],
    queryFn: async () => {
      const res = await authFetch(`/users/${user.uid}`);
      if (res.status === 404) {
        const err = new Error("PROFILE_NOT_FOUND");
        err.code = 404;
        throw err;
      }

      return null;
    },
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (user && profileError && profileError.code === 404) {
      setDeletedProfileModalOpen(true);
    }
  }, [user, profileError]);

  const handleDeletedProfileClose = async () => {
    setDeletedProfileModalOpen(false);
    await logout();
    navigate("/cadastro", { replace: true });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Routes>
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
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
      </Routes>
      <AlertModal
        open={deletedProfileModalOpen}
        onClose={handleDeletedProfileClose}
        title="Conta excluída"
        message={"Sua conta foi excluída por um administrador. Clique em Continuar para ir para a página de cadastro."}
        okText="Continuar"
      />
    </>
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