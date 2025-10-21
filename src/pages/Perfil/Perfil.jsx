import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // Importa o useQuery
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi"; // Usaremos o useApi como fetcher
import styles from "./Perfil.module.css";

const Perfil = () => {
  const [role, setRole] = useState("admin");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { authFetch } = useApi();

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", user?.uid], // Chave única para o cache
    queryFn: () => authFetch(`/users/${user.uid}`).then((res) => res.json()),
    enabled: !!user, // Só executa a query se o 'user' existir
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  if (isLoading) {
    return <div className={styles.perfil}>Carregando perfil...</div>;
  }

  if (error) {
    // O objeto de erro do React Query já tem a mensagem
    return (
      <div className={styles.perfil}>
        <p className="error">Erro ao carregar o perfil: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.perfil}>
      <h1>Gerenciamento de Estoque e Funcionários</h1>
      <section>
        <h2>Informações do Perfil</h2>
        <p>Visualize e edite suas informações pessoais</p>
        {profileData && (
          <>
            <p>
              <strong>Nome:</strong> {profileData.name}
            </p>
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>
            <p>
              <strong>Nome do Sebo:</strong> {profileData.nameSebo}
            </p>
            <p>
              <strong>Função:</strong> {profileData.role}
            </p>
          </>
        )}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair
        </button>
      </section>
      <section>
        <div className={styles.textEmployees}>
          <h2>Gerenciar Funcionários</h2>
          <p>Adicione, edite ou remova funcionários do sistema</p>
        </div>
        <button>Adicionar Funcionário</button>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          {/* <tbody> */}
        </table>
      </section>
      <p>Tipo de usuário:</p>
      <div>
        <input
          type="radio"
          id="leitor"
          name="role"
          value="leitor"
          checked={role === "leitor"}
          onChange={(e) => setRole(e.target.value)}
        />
        <label htmlFor="leitor">Leitor</label>
      </div>
      <div>
        <input
          type="radio"
          id="editor"
          name="role"
          value="editor"
          checked={role === "editor"}
          onChange={(e) => setRole(e.target.value)}
        />
        <label htmlFor="editor">Editor</label>
      </div>
      <div>
        <input
          type="radio"
          id="admin"
          name="role"
          value="admin"
          checked={role === "admin"}
          onChange={(e) => setRole(e.target.value)}
        />
        <label htmlFor="admin">Admin</label>
      </div>
    </div>
  );
};

export default Perfil;
