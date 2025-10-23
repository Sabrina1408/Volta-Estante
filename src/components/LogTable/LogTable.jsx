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
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp._seconds * 1000).toLocaleString("pt-BR")}</td>
              <td>{log.userEmail}</td>
              <td>{log.action}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;