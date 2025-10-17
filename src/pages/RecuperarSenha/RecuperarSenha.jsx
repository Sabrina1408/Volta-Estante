import { useState } from 'react';
import styles from './RecuperarSenha.module.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from '../../firebase/config';

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setSuccess("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
      setEmail("");
    } catch (err) {
      console.error("reset password error:", err);
      const friendly =
        err?.code === "auth/user-not-found"
          ? "E-mail não cadastrado."
          : err?.code === "auth/invalid-email"
          ? "E-mail inválido."
          : err?.message || "Erro ao enviar e-mail de recuperação.";
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.recuperarSenha}>
      <h1>Recuperar Senha</h1>
      <p>Digite seu e-mail para receber um link de redefinição de senha.</p>
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
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default RecuperarSenha;