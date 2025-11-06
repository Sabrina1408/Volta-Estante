import styles from "./Home.module.css";
import stackBooks from "../../assets/books.png";
import dash from "../../assets/dash.png";
import googleBooks from "../../assets/Google_Play_Books.png";

const Home = () => {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.text}>
          <h1>
            A Gestão Inteligente que o Seu Sebo Merece: Estoque, Análise e
            Controle Total.
          </h1>
          <p>
            Nosso sistema foi desenvolvido para donos de sebos que buscam
            otimizar o gerenciamento de seu estoque de livros. Oferecemos um
            painel acessível por meio de um sistema de autenticação segura
            (Firebase Authentication)
          </p>
          <p>
            Visão Completa e Decisões Baseadas em Dados Tenha controle total com
            nosso Dashboard (Painel de Controle), que oferece uma visão geral e
            informações rápidas e essenciais sobre o seu negócio. Utilize
            gráficos informativos para monitorar:
          </p>
          <ul className={styles.list}>
            <li>Livros e gêneros mais vendidos (por unidade).</li>
            <li>Itens com as melhores avaliações.</li>
            <li>O valor total estimado do estoque.</li>
          </ul>
        </div>
        <img src={stackBooks} alt="Livros em pilha" />
      </main>
      <section className={styles.fullWidthImage}>
        <img src={dash} alt="Tela de dashboard" />
      </section>
      <section className={styles.imageAndText}>
        <img src={googleBooks} alt="Logo Google Books" />
        <div className={styles.text}>
          <p>
            O gerenciamento do Estoque é simplificado com uma exibição completa
            dos livros, permitindo a utilização de Filtros por qualquer campo
            (autor, nome, gênero, etc.) e funcionalidades CRUD (Criar, Read,
            Update, Delete) diretamente na tabela. Para maior eficiência,
            utilizamos a Google Books API para buscar e preencher
            automaticamente as informações dos livros a partir do ISBN ou
            título.
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;
