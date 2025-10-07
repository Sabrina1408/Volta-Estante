// CSS
import styles from "./Home.module.css";
// Hooks
import { useState } from "react";

const Home = () => {
  return (
    <main className={styles.main}>
      <div className={styles.text}>
        <h1>
          A Gestão Inteligente que o Seu Sebo Merece: Estoque, Análise e
          Controle Total.
        </h1>
        <p>
          Nosso sistema foi desenvolvido para donos de sebos que buscam otimizar
          o gerenciamento de seu estoque de livros. Oferecemos um painel
          acessível por meio de um sistema de autenticação segura (Firebase
          Authentication)
        </p>
        <p>
          Visão Completa e Decisões Baseadas em Dados Tenha controle total com
          nosso Dashboard (Painel de Controle), que oferece uma visão geral e
          informações rápidas e essenciais sobre o seu negócio. Utilize gráficos
          informativos para monitorar:
        </p>
        <ul className={styles.list}>
          <li>Livros e gêneros mais vendidos (por unidade).</li>
          <li>Itens com as melhores avaliações.</li>
          <li>O valor total estimado do estoque.</li>
        </ul>
      </div>
      <img src="../../src/assets/StackBooks.jpg" alt="" />
    </main>
  );
};

export default Home;
