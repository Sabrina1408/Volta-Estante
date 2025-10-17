import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../lib/api";
import styles from "./Perfil.module.css";

const Perfil = () => {
  const [role, setRole] = useState("leitor");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const { authFetch } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const res = await authFetch(`http://localhost:5000/users/${user.uid}`);
        if (!res.ok) {
          throw new Error("Falha ao buscar dados do perfil.");
        }
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authFetch]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  if (loading) {
    return <div className={styles.perfil}>Carregando perfil...</div>;
  }

  if (error) {
    return <div className={`${styles.perfil} ${styles.error}`}>{error}</div>;
  }

  return (
    <div className={styles.perfil}>
      <h1>Seu Perfil</h1>
      {profileData && (
        <>
          <p><strong>Nome:</strong> {profileData.name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Nome do Sebo:</strong> {profileData.nameSebo}</p>
          <p><strong>Função:</strong> {profileData.role}</p>
        </>
      )}
      <button className={styles.logoutButton} onClick={handleLogout}>Sair</button>

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
