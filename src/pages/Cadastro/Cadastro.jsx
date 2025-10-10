import { useState } from "react";
import styles from "./Cadastro.module.css";

const Cadastro = () => {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeSebo, setNomeSebo] = useState("");
   const [error, setError] = useState(""); 

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); 
    
    if (senha.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return; // Interrompe o envio do formulário
    }

    console.log({
      nome,
      email,
      senha,
      nomeSebo
    });
    
    alert("Cadastro realizado com sucesso!");

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
