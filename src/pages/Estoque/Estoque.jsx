import styles from "./Estoque.module.css";
import { useState } from "react";
import AddBookModal from "../../components/AddBookModal/AddBookModal";

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
      </div>
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Estoque;
