import { useState } from "react";
import styles from "./Perfil.module.css";

const Perfil = () => {

  const [role, setRole] = useState("leitor");

  return (
    <div className={styles.roleSelection}>
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
}

export default Perfil;
