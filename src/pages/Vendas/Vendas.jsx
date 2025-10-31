import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import styles from './Vendas.module.css';
import Spinner from '../../components/Spinner/Spinner';

const Vendas = () => {
  const { authFetch } = useApi();

  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: () => authFetch('/sales').then((res) => res.json()),
  });

  return (
    <div className={styles.vendasContainer}>
      <div className={styles.salesCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Histórico de Vendas</h1>
          <p className={styles.subtitle}>Consulte o registro de todas as vendas realizadas no sistema.</p>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        {isLoading && <Spinner />}
        {error && <p className="error">Erro ao carregar vendas: {error.message}</p>}
        {sales && (
          <table className={styles.salesTable}>
            <thead>
              <tr>
                <th>ID da Venda</th>
                <th>Data</th>
                <th>Livro</th>
                <th>ISBN</th>
                <th>Preço</th>
                <th>Estado</th>
                <th>Vendido por</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.sale_id}>
                  <td data-label="ID da Venda">{sale.saleId}</td>
                  <td data-label="Data">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td>
                  <td data-label="Livro">{sale.bookTitle}</td>
                  <td data-label="ISBN">{sale.isbn}</td>
                  <td data-label="Preço">{sale.bookPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td data-label="Estado">{sale.conservationState}</td>
                  <td data-label="Vendido por">{sale.userName}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="7">Nenhuma venda encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
  );
};

export default Vendas;
