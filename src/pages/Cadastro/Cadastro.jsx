import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import styles from "./Cadastro.module.css";
import { useApi } from "../../hooks/useApi";
import { getFriendlyFirebaseError } from "../../utils/firebaseErrors";

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeSebo, setNomeSebo] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const { authFetch } = useApi();
  const navigate = useNavigate();

  // React Query mutation hook
  const { mutateAsync: createUser, isLoading } = useMutation({
    mutationFn: (payload) =>
      authFetch("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).then(res => { if (!res.ok) throw new Error('Failed to create user in backend'); return res.json() }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (senha.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    let cred = null; // Declarar fora para ser acessível no catch
    try {
      cred = await signup(email, senha, nome);

      // Payload para o seu backend
      const payload = {
        userId: cred.user.uid,
        name: nome,
        email,
        nameSebo: nomeSebo,
      };

      await createUser(payload);
      alert("Usuário cadastrado com sucesso!");
      navigate("/login");

    } catch (error) {
      // Se a criação no backend falhar, o usuário do Firebase já foi criado.
      // Precisamos deletá-lo para manter a consistência (rollback).
      if (cred?.user) {
        await cred.user.delete().catch(err => console.error("Falha ao fazer rollback do usuário no Firebase:", err));
      }

      const friendlyError = getFriendlyFirebaseError(error?.code, "Erro ao cadastrar");
      setError(friendlyError);
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

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default Cadastro;
