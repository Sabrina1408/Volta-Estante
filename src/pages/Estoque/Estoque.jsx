import styles from "./Estoque.module.css";
import { useState } from "react";
import { FaHistory, FaPlus } from "react-icons/fa";
import AddBookModal from "../../components/AddBookModal/AddBookModal";
import StockTable from "../../components/StockTable/StockTable";

const Estoque = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  return (
    <>
      <div className={styles.estoque}>
        <div className={styles.header}>
          <h1>Estoque</h1>
          <div className={styles.actions}>
            <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
              <FaPlus /> Adicionar Livro
            </button>
          </div>
        </div>
        <StockTable />
      </div>
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Estoque;
