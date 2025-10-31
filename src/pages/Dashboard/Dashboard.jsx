import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaDollarSign, FaTags, FaBoxOpen, FaShoppingCart } from "react-icons/fa";
import { useApi } from "../../hooks/useApi";
import styles from "./Dashboard.module.css";
import Spinner from "../../components/Spinner/Spinner";
/**
 * Helper para ler o valor de uma variável CSS do :root.
 * Necessário porque os atributos SVG (fill, stroke) não resolvem var() diretamente.
 * @param {string} variable - O nome da variável CSS (ex: '--metric-blue').
 * @returns {string} O valor computado da cor (ex: '#3b82f6').
 */
const getCssVariableValue = (variable) => {
  // Garante que o código não quebre em ambientes sem DOM (ex: SSR)
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const Dashboard = () => {
  const { authFetch } = useApi();
  const [filters, setFilters] = useState({
    category: 'all',
    conservation: 'all',
    month: 'all',
    year: 'all',
  });

  const [chartColors, setChartColors] = useState({
    metricBlue: "",
    chartBlueStrong: "",
    chartPurpleStrong: "",
    chartOrangeVibrant: "",
    pieColor1: "",
    pieColor2: "",
    pieColor3: "",
    pieColor4: "",
  });

  useEffect(() => {
    // Garante que o código não quebre em ambientes sem DOM (ex: SSR)
    if (typeof window === "undefined") return;

    const metricBlue = getCssVariableValue("--metric-blue");
    const chartBlueStrong = getCssVariableValue("--chart-blue-strong");
    const chartPurpleStrong = getCssVariableValue("--chart-purple-strong");
    const chartOrangeVibrant = getCssVariableValue("--chart-orange-vibrant");
    const pieColor1 = getCssVariableValue("--pie-color-1");
    const pieColor2 = getCssVariableValue("--pie-color-2");
    const pieColor3 = getCssVariableValue("--pie-color-3");
    const pieColor4 = getCssVariableValue("--pie-color-4");

    setChartColors({
      metricBlue,
      chartBlueStrong,
      chartPurpleStrong,
      chartOrangeVibrant,
      pieColor1,
      pieColor2,
      pieColor3,
      pieColor4,
    });
  }, []);

  const { data: sales, isLoading: isLoadingSales, isError: isErrorSales, error: errorSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => authFetch('/sales').then(res => res.json())
  });

  const { data: stock, isLoading: isLoadingStock, isError: isErrorStock, error: errorStock } = useQuery({
    queryKey: ['stock'],
    // O endpoint /books retorna a lista de livros com a quantidade total de cada um
    queryFn: () => authFetch('/books').then(res => res.json())
  });

  const filterOptions = useMemo(() => {
    if (!sales) {
      return {
        categories: [],
        conservations: [],
        months: [],
        years: [],
      };
    }

    const categories = [...new Set(sales.flatMap(sale => sale.bookCategory))];
    const conservations = [...new Set(sales.map(sale => sale.conservationState))];
    const dates = sales.map(sale => new Date(sale.saleDate));
    const months = [...new Set(dates.map(date => date.toLocaleString('pt-BR', { month: 'long' })))];
    const years = [...new Set(dates.map(date => date.getFullYear()))].sort((a, b) => a - b);

    return { categories, conservations, months, years };
  }, [sales]);

  const processedData = useMemo(() => {
    const filteredSales = sales ? sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      if (filters.category !== 'all' && !sale.bookCategory.includes(filters.category)) {
        return false;
      }
      if (filters.conservation !== 'all' && sale.conservationState !== filters.conservation) {
        return false;
      }
      if (filters.month !== 'all' && saleDate.toLocaleString('pt-BR', { month: 'long' }) !== filters.month) {
        return false;
      }
      if (filters.year !== 'all' && saleDate.getFullYear() !== parseInt(filters.year)) {
        return false;
      }
      return true;
    }) : [];

    if (!filteredSales || filteredSales.length === 0) {
      return {
        totalRevenue: 0,
        averagePrice: 0,
        totalBooksSold: 0,
        revenueOverTimeData: [],
        revenueByCategoryData: [],
        salesByStateData: [],
        salesByCategoryData: [],
        ratingByCategoryData: [],
      };
    }

    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.bookPrice, 0);
    const totalBooksSold = filteredSales.length;
    const averagePrice = totalBooksSold > 0 ? totalRevenue / totalBooksSold : 0;

    let revenueOverTimeData;
    if (filters.month !== 'all') {
      // A month is selected, group by day
      const revenueByDay = filteredSales.reduce((acc, sale) => {
        const day = new Date(sale.saleDate).getDate();
        acc[day] = (acc[day] || 0) + sale.bookPrice;
        return acc;
      }, {});
      revenueOverTimeData = Object.entries(revenueByDay)
        .map(([name, Receita]) => ({ name: `Dia ${name}`, Receita }))
        .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
    } else {
      // No month selected, group by month
      const revenueByMonth = filteredSales.reduce((acc, sale) => {
        const month = new Date(sale.saleDate).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + sale.bookPrice;
        return acc;
      }, {});
      revenueOverTimeData = Object.entries(revenueByMonth).map(([name, Receita]) => ({ name, Receita }));
    }

    const byCategory = filteredSales.reduce((acc, sale) => {
      sale.bookCategory.forEach(category => {
        if (!acc[category]) {
          acc[category] = { revenue: 0, count: 0, ratings: [] };
        }
        acc[category].revenue += sale.bookPrice;
        acc[category].count += 1;
        if (sale.averageRating) {
          acc[category].ratings.push(sale.averageRating);
        }
      });
      return acc;
    }, {});

    const revenueByCategoryData = Object.entries(byCategory).map(([name, data]) => ({ name, value: data.revenue }));
    const salesByCategoryData = Object.entries(byCategory).map(([name, data]) => ({ name, value: data.count }));
    const ratingByCategoryData = Object.entries(byCategory).map(([name, data]) => {
      const avgRating = data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0;
      return { name, value: avgRating };
    });

    const byState = filteredSales.reduce((acc, sale) => {
      const state = sale.conservationState;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    const salesByStateData = Object.entries(byState).map(([name, count]) => ({
      name,
      value: (count / totalBooksSold) * 100
    }));

    return {
      totalRevenue,
      averagePrice,
      totalBooksSold,
      revenueOverTimeData,
      revenueByCategoryData,
      salesByStateData,
      salesByCategoryData,
      ratingByCategoryData,
    };
  }, [sales, filters]);

  const totalStock = useMemo(() => {
    if (!stock) return 0;
    // Soma a 'totalQuantity' de cada livro para obter o estoque total
    return stock.reduce((acc, book) => acc + (book.totalQuantity || 0), 0);
  }, [stock]);

  if (isLoadingSales || isLoadingStock) {
    return <div className={styles.centered}><Spinner /></div>;
  }

  if (isErrorSales || isErrorStock) {
    const errorMessage = errorSales?.message || errorStock?.message;
    return <div className={styles.centered}>Erro ao carregar dados: {errorMessage}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardPage}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Consulte as métricas de vendas e estoque.</p>
        </div>
      </div>

          <div className={styles.filterCard}>
            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="category-filter">Categorias</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category-filter"
                  className={styles.filterSelect}
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="all">Todas as categorias</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conservation Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="conservation-filter"> Conservação</label>
              <div className={styles.selectWrapper}>
                <select
                  id="conservation-filter"
                  className={styles.filterSelect}
                  value={filters.conservation}
                  onChange={(e) => setFilters(prev => ({ ...prev, conservation: e.target.value }))}
                >
                  <option value="all">Todos os estados</option>
                  {filterOptions.conservations.map(conservation => (
                    <option key={conservation} value={conservation}>{conservation}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="month-filter">Mês</label>
              <div className={styles.selectWrapper}>
                <select
                  id="month-filter"
                  className={styles.filterSelect}
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                >
                  <option value="all">Todos os meses</option>
                  {filterOptions.months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="year-filter">Ano</label>
              <div className={styles.selectWrapper}>
                <select
                  id="year-filter"
                  className={styles.filterSelect}
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                >
                  <option value="all">Todos os anos</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.metricGreenBg}`}>
                <FaDollarSign />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricTitle}>Receita Total</span>
                <span className={`${styles.metricValue} ${styles.metricGreen}`}>
                  {processedData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.metricBlueBg}`}>
                <FaTags />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricTitle}>Preço Médio por Venda</span>
                <span className={`${styles.metricValue} ${styles.metricBlue}`}>
                  {processedData.averagePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.metricPurpleBg}`}>
                <FaBoxOpen />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricTitle}>Livros em Estoque</span>
                <span className={`${styles.metricValue} ${styles.metricPurple}`}>{totalStock}</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.metricOrangeBg}`}>
                <FaShoppingCart />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricTitle}>Total de Livros Vendidos</span>
                <span className={`${styles.metricValue} ${styles.metricOrange}`}>{processedData.totalBooksSold}</span>
              </div>
            </div>
          </div>

          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <h3 className={styles.chartTitle}>Receita ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.revenueOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ color: "var(--text-light)" }}
                />
                <Line
                  type="monotone"
                  dataKey="Receita"
                  stroke={chartColors.metricBlue}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.secondaryChartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Receita por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.revenueByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={chartColors.chartBlueStrong} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Vendas por Estado de Conservação</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.salesByStateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {processedData.salesByStateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[chartColors.pieColor1, chartColors.pieColor2, chartColors.pieColor3, chartColors.pieColor4][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value.toFixed(2)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Vendas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.salesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={chartColors.chartPurpleStrong} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Avaliação Média por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.ratingByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill={chartColors.chartOrangeVibrant} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        
    </div>
  </div>
  );
};

export default Dashboard;
