import styles from "./Estoque.module.css";
import { useState } from "react";
import AddBookModal from "../../components/AddBookModal/AddBookModal";
import LogTable from "../../components/LogTable/LogTable";

const Estoque = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  return (
    <>
      <div className={styles.estoque}>
        <div className={styles.header}>
          <h1>Estoque</h1>
          <div className={styles.actions}>
            <button onClick={() => setShowLogs(!showLogs)} className={styles.logButton}>
              {showLogs ? "Ocultar Histórico" : "Ver Histórico"}
            </button>
            <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
              Adicionar Livro
            </button>
          </div>
        </div>
        {showLogs && <LogTable />}
      </div>
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Estoque;
