import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import styles from './Vendas.module.css';
import SalesTable from '../../components/SalesTableModal/SalesTable';

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
    
    const splitCategories = (categoryString) => {
      if (!categoryString) return [];
      return categoryString.split(',').map(cat => cat.trim()).filter(Boolean);
    };

    const categories = [...new Set(
      sales.flatMap(sale => {
        const categories = sale.bookCategory;
        if (!categories) return [];
        if (typeof categories === 'string') return splitCategories(categories);
        if (Array.isArray(categories)) {
          return categories.flatMap(cat => splitCategories(cat));
        }
        return [];
      })
    )].sort();
    
    return { categories };
  }, [sales]);

  const filteredSales = useMemo(() => {
    let sortedSales = sales
      ? [...sales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
      : [];

    if (filters.category !== 'all') {
      sortedSales = sortedSales.filter(sale => {
        const categories = sale.bookCategory;
        if (!categories) return false;

        const hasCategory = (categoryStr) => {
          return categoryStr.split(',')
            .map(cat => cat.trim())
            .some(cat => cat === filters.category);
        };

        if (typeof categories === 'string') return hasCategory(categories);
        if (Array.isArray(categories)) {
          return categories.some(cat => hasCategory(cat));
        }
        return false;
      });
    }

    if (filters.isHot) {
      sortedSales = sortedSales.filter(sale => 
        sale.ratingsCount !== undefined && 
        sale.averageRating !== undefined &&
        sale.ratingsCount >= 1 && 
        sale.averageRating >= 1
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
              Mais avaliados
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <SalesTable 
            sales={paginatedSales}
            isLoading={isLoading}
            error={error}
          />
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