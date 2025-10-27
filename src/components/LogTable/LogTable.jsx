import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import styles from "./LogTable.module.css";

const LogTable = () => {
  const { authFetch } = useApi();

  const {
    // Renomeando 'data' para 'allLogs' para maior clareza
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: () => authFetch("/logs").then((res) => res.json()),
  });

  // Estado para controlar a página atual
  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 20; // Define quantos logs serão exibidos por página

  // Ordena os logs pela data mais recente primeiro
  const sortedLogs = logs
    ? [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  // Lógica de paginação

  if (isLoading) {
    return <p className={styles.loading}>Carregando histórico...</p>;
  }

  if (error) {
    return <p className="error">Erro ao carregar o histórico: {error.message}</p>;
  }

  if (!sortedLogs || sortedLogs.length === 0) {
    return <p>Nenhum registro de alteração encontrado.</p>;
  }

  // Calcula o total de páginas
  const totalPages = Math.ceil(sortedLogs.length / LOGS_PER_PAGE);

  // "Fatia" o array de logs para obter apenas os da página atual
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );


  return (
    <div className={styles.logContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.logTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, index) => (
              // Usando o índice + timestamp para garantir uma chave única, resolvendo o warning.
              <tr key={`${log.timestamp}-${index}`}>
                <td>{new Date(log.timestamp).toLocaleString("pt-BR")}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
                {/* Verifica se 'details' é um objeto e o converte para string se for, corrigindo o erro de renderização. */}
                <td>{typeof log.details === 'object' && log.details !== null ? JSON.stringify(log.details) : log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default LogTable;