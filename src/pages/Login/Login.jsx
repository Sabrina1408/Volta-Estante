import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';
import { getFriendlyFirebaseError } from '../../utils/firebaseErrors';

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      navigate("/perfil");
    },
    onError: (err) => {
      console.error("login error:", err);
      const friendlyError = getFriendlyFirebaseError(err?.code, "Erro ao efetuar login.");
      setError(friendlyError);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !senha) return;
    mutate({ email, password: senha });
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        {error && <p className="error">{error}</p>}

        <p className={styles.forgotPassword}>
          <Link to="/recuperarSenha">Esqueci minha senha</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;