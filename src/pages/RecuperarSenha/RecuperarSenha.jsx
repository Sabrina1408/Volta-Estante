import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './RecuperarSenha.module.css';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyError } from '../../utils/errorMessages';

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { resetPassword } = useAuth();

  const { mutate, isLoading } = useMutation({
    mutationFn: (emailToReset) => resetPassword(emailToReset),
    onSuccess: () => {
      setSuccess("E-mail de recuperação enviado com sucesso!");
      setEmail("");
    },
    onError: (err) => {
      console.error("reset password error:", err);
      const friendlyError = getFriendlyError(err?.code, "PASSWORD_RESET_FAILED");
      setError(friendlyError);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Informe um e-mail válido.");
      return;
    }

    mutate(email);
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {success && <p className={styles.success}>{success}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default RecuperarSenha;