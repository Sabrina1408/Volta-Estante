import styles from "./Estoque.module.css";
import { useState } from "react";
import AddBookModal from "../../components/AddBookModal";

const Estoque = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.estoque}>
        <div className={styles.header}>
          <h1>Estoque</h1>
          <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
            Adicionar Livro
          </button>
        </div>

        {/* Aqui você pode adicionar a lógica para listar os livros do estoque */}
        <p>A lista de livros do seu estoque aparecerá aqui.</p>
      </div>
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Estoque;
