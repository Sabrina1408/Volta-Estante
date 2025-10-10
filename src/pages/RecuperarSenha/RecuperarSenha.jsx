import { useState } from 'react';
import styles from './RecuperarSenha.module.css';

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Pedido de recuperação para o email:", email);
    
    alert("Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
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
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default RecuperarSenha;