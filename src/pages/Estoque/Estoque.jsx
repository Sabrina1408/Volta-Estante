import styles from "./Estoque.module.css";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import AddBookModal from "../../components/AddBookModal/AddBookModal";
import StockTable from "../../components/StockTable/StockTable";

const Estoque = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const { authFetch } = useApi();
  const { user } = useAuth();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      const res = await authFetch(`/users/${user.uid}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar os dados do perfil.");
      }
      return res.json();
    },
    enabled: !!user,
  });

  const isReader = profileData?.userRole === "Reader";

  return (
    <div className={styles.estoqueContainer}>
      <div className={styles.estoque}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Estoque</h1>
            <p className={styles.subtitle}>Consulte e gerencie o estoque de livros.</p>
          </div>
          {!isLoadingProfile && !isReader && (
            <div className={styles.actions}>
              <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
                <FaPlus /> Adicionar Livro
              </button>
            </div>
          )}
        </div>
        <StockTable />
      </div>
      {!isLoadingProfile && !isReader && <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Estoque;