import LogTable from '../../components/LogTable/LogTable';
import styles from './Logs.module.css';

const Logs = () => {
  return (
    <div className={styles.logsContainer}>
      <div className={styles.logsCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Histórico de Alterações</h1>
            <p className={styles.subtitle}>Consulte o registro de todas as alterações realizadas no sistema.</p>
          </div>
        </div>
        <LogTable />
      </div>
    </div>
  );
};

export default Logs;
