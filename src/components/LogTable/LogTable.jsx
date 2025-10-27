import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import styles from "./LogTable.module.css";

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

  if (isLoading) {
    return <p className={styles.loading}>Carregando histórico...</p>;
  }

  if (error) {
    return <p className="error">Erro ao carregar o histórico: {error.message}</p>;
  }

  if (!logs || logs.length === 0) {
    return <p>Nenhum registro de alteração encontrado.</p>;
  }

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
            {logs.map((log, index) => (
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
    </div>
  );
};

export default LogTable;