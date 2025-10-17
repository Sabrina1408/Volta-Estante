import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; // Importar o Link
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, senha);
      navigate("/");
    } catch (err) {
      console.error("login error:", err);
      const friendly =
        err?.code === "auth/wrong-password"
          ? "Senha incorreta."
          : err?.code === "auth/user-not-found"
          ? "Usuário não encontrado."
          : err?.message || "Erro ao efetuar login.";
      setError(friendly);
    }
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

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.forgotPassword}>
          <Link to="/recuperarSenha">Esqueci minha senha</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;