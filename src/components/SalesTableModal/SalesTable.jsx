import styles from './SalesTable.module.css';
import Spinner from '../Spinner/Spinner';
import { getFriendlyError } from '../../utils/errorMessages';

const SalesTable = ({ sales, isLoading, error }) => {
  return (
    <div className={styles.tableWrapper}>
      {isLoading && <Spinner />}
      {error && <p className="error">{getFriendlyError('SALE_LOAD_FAILED')}</p>}
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
              <th>Avaliação</th>
              <th>Número de Avaliações</th>
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
                <td data-label="Avaliação">{sale.averageRating ? sale.averageRating.toFixed(1) : 'N/A'}</td>
                <td data-label="Número de Avaliações">{sale.ratingsCount || 'N/A'}</td>
                <td data-label="Vendido por">{sale.userName}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="9">Nenhuma venda encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesTable;
