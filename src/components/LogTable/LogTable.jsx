import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import styles from "./LogTable.module.css";
import { getFriendlyError } from "../../utils/errorMessages";

const LogTable = () => {
  const { authFetch } = useApi();

  const {

    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: () => authFetch("/logs").then((res) => res.json()),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 20;

  const sortedLogs = logs
    ? [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  if (isLoading) {
    return <p className={styles.loading}>Carregando histórico...</p>;
  }

  if (error) {
    return <p className="error">{getFriendlyError('LOG_LOAD_FAILED')}</p>;
  }

  if (!sortedLogs || sortedLogs.length === 0) {
    return <p>Nenhum registro de alteração encontrado.</p>;
  }

  const totalPages = Math.ceil(sortedLogs.length / LOGS_PER_PAGE);

  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  return (
    <>
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

              <tr key={`${log.timestamp}-${index}`}>
                <td>{log.timestamp ? new Date(log.timestamp).toLocaleString("pt-BR") : "-"}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
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
    </>
  );
};

export default LogTable;