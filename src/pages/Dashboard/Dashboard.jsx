import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";import {
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
import { FaDollarSign, FaTags, FaBoxOpen, FaShoppingCart, FaFilter } from "react-icons/fa";
import { useApi } from "../../hooks/useApi";
import styles from "./Dashboard.module.css";
import Spinner from "../../components/Spinner/Spinner";

const PIE_COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#AF19FF"];

const Dashboard = () => {
  const { authFetch } = useApi();

  const { data: sales, isLoading: isLoadingSales, isError: isErrorSales, error: errorSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => authFetch('/sales').then(res => res.json())
  });

  const { data: stock, isLoading: isLoadingStock, isError: isErrorStock, error: errorStock } = useQuery({
    queryKey: ['stock'],
    // O endpoint /books retorna a lista de livros com a quantidade total de cada um
    queryFn: () => authFetch('/books').then(res => res.json())
  });

  const processedData = useMemo(() => {
    if (!sales || sales.length === 0) {
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

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.bookPrice, 0);
    const totalBooksSold = sales.length;
    const averagePrice = totalBooksSold > 0 ? totalRevenue / totalBooksSold : 0;

    const revenueOverTime = sales.reduce((acc, sale) => {
      const month = new Date(sale.saleDate).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + sale.bookPrice;
      return acc;
    }, {});
    const revenueOverTimeData = Object.entries(revenueOverTime).map(([name, Receita]) => ({ name, Receita }));

    const byCategory = sales.reduce((acc, sale) => {
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

    const byState = sales.reduce((acc, sale) => {
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
  }, [sales]);

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
      <h1>Dashboard</h1>
      <div className={styles.filterBar}>
        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select className={styles.filterSelect}>
            <option>Categorias</option>
          </select>
        </div>
        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select className={styles.filterSelect}>
            <option>Idioma do livro</option>
          </select>
        </div>
        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select className={styles.filterSelect}>
            <option>Mês</option>
          </select>
        </div>
        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select className={styles.filterSelect}>
            <option>Ano</option>
          </select>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.lightGreenBg}`}>
            <FaDollarSign />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Receita Total</span>
            <span className={styles.metricValue}>{processedData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.lightBlueBg}`}>
            <FaTags />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Preço Médio por Venda</span>
            <span className={styles.metricValue}>{processedData.averagePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.softPurpleBg}`}>
            <FaBoxOpen />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Livros em Estoque</span>
            <span className={styles.metricValue}>{totalStock}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.lightOrangeBg}`}>
            <FaShoppingCart />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Total de Livros Vendidos</span>
            <span className={styles.metricValue}>{processedData.totalBooksSold}</span>
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
              wrapperStyle={{ color: "var(--lightGreen)" }}
            />
            <Line
              type="monotone"
              dataKey="Receita"
              stroke="var(--lightBlue)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Receita por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData.revenueByCategoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="var(--strongBlue)" />
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
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
            <Bar dataKey="value" fill="var(--strongPurple)" />
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
            <Bar dataKey="value" fill="var(--vibrantOrange)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
