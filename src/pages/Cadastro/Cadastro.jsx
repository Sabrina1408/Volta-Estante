import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Cadastro.module.css";

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeSebo, setNomeSebo] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (senha.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return; // Interrompe o envio do formulário
    }

    try {
      const cred = await signup(email, senha);
      const firebaseUser = cred.user;
      const idToken = await firebaseUser.getIdToken();

      const payload = {
        userId: firebaseUser.uid,
        name: nome,
        email,
        nameSebo: nomeSebo,
      };

      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + idToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // rollback: remove o user criado no Firebase (cliente)
        await firebaseUser.delete().catch(() => null);
        throw new Error(err.message || "Erro ao salvar usuário no backend");
      }

      alert("Usuário cadastrado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("signup error:", error);
      const friendly =
        error?.code === "auth/email-already-in-use"
          ? "Este e-mail já está em uso."
          : error?.message || "Erro ao cadastrar";
      setError(friendly);
    }

  };

  return (
    <div className={styles.cadastro}>
      <h1>Cadastre-se</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome:</label>
        <input
          type="text"
          id="nome"
          name="nome"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          name="senha"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <label htmlFor="nomeSebo">Nome do Sebo:</label>
        <input
          type="text"
          id="nomeSebo"
          name="nomeSebo"
          required
          value={nomeSebo}
          onChange={(e) => setNomeSebo(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Cadastro;
