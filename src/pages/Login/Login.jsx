import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importar o Link
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tentativa de login com:", { email, senha });
    // Aqui virá a lógica de autenticação
  };

  return (
    <div className={styles.login}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
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

        <button type="submit">Entrar</button>

        <p className={styles.forgotPassword}>
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;