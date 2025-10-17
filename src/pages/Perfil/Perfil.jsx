import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Perfil.module.css";

const Perfil = () => {
  const [role, setRole] = useState("leitor");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  return (
    <div className={styles.roleSelection}>
      {user && (
        <>
          <div>
            <button className={styles.linkButton} onClick={handleLogout}>
              Sair
            </button>
          </div>
          <p>{user.email}</p>
        </>
      )}

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
