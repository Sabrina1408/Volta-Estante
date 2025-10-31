import styles from "./Estoque.module.css";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AddBookModal from "../../components/AddBookModal/AddBookModal";
import StockTable from "../../components/StockTable/StockTable";

const Estoque = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className={styles.estoqueContainer}>
      <div className={styles.estoque}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Estoque</h1>
            <p className={styles.subtitle}>Consulte e gerencie o estoque de livros.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
              <FaPlus /> Adicionar Livro
            </button>
          </div>
        </div>
        <StockTable />
      </div>
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Estoque;
