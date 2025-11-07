import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import styles from './Vendas.module.css';
import Spinner from '../../components/Spinner/Spinner';

const Vendas = () => {
  const { authFetch } = useApi();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: 'all',
    isHot: false,
  });
  const SALES_PER_PAGE = 20;

  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: () => authFetch('/sales').then((res) => res.json()),
  });

  const filterOptions = useMemo(() => {
    if (!sales) {
      return {
        categories: [],
      };
    }
    const categories = [...new Set(sales.flatMap(sale => sale.bookCategory))];
    return { categories };
  }, [sales]);

  const filteredSales = useMemo(() => {
    let sortedSales = sales
      ? [...sales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
      : [];

    if (filters.category !== 'all') {
      sortedSales = sortedSales.filter(sale => sale.bookCategory.includes(filters.category));
    }

    if (filters.isHot) {
      sortedSales = sortedSales.filter(sale => 
        sale.ratingsCount !== undefined && 
        sale.averageRating !== undefined &&
        sale.ratingsCount >= 100 && 
        sale.averageRating >= 4
      );
    }

    return sortedSales;
  }, [sales, filters]);

  const totalPages = Math.ceil(filteredSales.length / SALES_PER_PAGE);

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * SALES_PER_PAGE,
    currentPage * SALES_PER_PAGE
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const toggleHotFilter = () => {
    setFilters(prev => ({ ...prev, isHot: !prev.isHot }));
    setCurrentPage(1);
  };

  return (
    <div className={styles.vendasContainer}>
      <div className={styles.salesCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Histórico de Vendas</h1>
            <p className={styles.subtitle}>Consulte o registro de todas as vendas realizadas no sistema.</p>
          </div>
        </div>

        <div className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label htmlFor="category-filter">Categorias</label>
            <div className={styles.selectWrapper}>
              <select
                id="category-filter"
                name="category"
                className={styles.filterSelect}
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">Todas as categorias</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label>Filtros Adicionais</label>
            <button
              className={`${styles.hotFilterButton} ${filters.isHot ? styles.active : ''}`}
              onClick={toggleHotFilter}
            >
              Em Alta
            </button>
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
                {paginatedSales.map((sale) => (
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
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan="7">Nenhuma venda encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
      </div>
    </div>
  );
};

export default Vendas;