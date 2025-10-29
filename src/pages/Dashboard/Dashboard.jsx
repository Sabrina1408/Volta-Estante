import {
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
import styles from "./Dashboard.module.css";

// Mock data for charts
const revenueOverTimeData = [
  { name: "Jan", Receita: 4000 },
  { name: "Fev", Receita: 3000 },
  { name: "Mar", Receita: 5000 },
  { name: "Abr", Receita: 4500 },
  { name: "Mai", Receita: 6000 },
  { name: "Jun", Receita: 5500 },
  { name: "Jul", Receita: 6500 },
  { name: "Ago", Receita: 7000 },
  { name: "Set", Receita: 6800 },
  { name: "Out", Receita: 7200 },
];

const revenueByCategoryData = [
  { name: "Ficção", value: 15000 },
  { name: "Não-ficção", value: 12000 },
  { name: "Técnico", value: 9000 },
  { name: "Infantil", value: 6000 },
  { name: "Biografia", value: 4000 },
];

const salesByStateData = [
  { name: "Novo", value: 25 },
  { name: "Seminovo", value: 42 },
  { name: "Usado", value: 23 },
  { name: "Muito usado", value: 11 },
];

const salesByCategoryData = [
    { name: "Ficção", value: 95 },
    { name: "Não-ficção", value: 80 },
    { name: "Técnico", value: 50 },
    { name: "Infantil", value: 40 },
    { name: "Biografia", value: 25 },
];

const ratingByCategoryData = [
    { name: "Ficção", value: 4.5 },
    { name: "Não-ficção", value: 4.2 },
    { name: "Técnico", value: 4.0 },
    { name: "Infantil", value: 4.8 },
    { name: "Biografia", value: 4.6 },
];

const PIE_COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#AF19FF"];

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.filterBar}>
        <select className={styles.filterSelect}>
          <option>Categorias</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Idioma do livro</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Mês</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Ano</option>
        </select>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'var(--lightGreen)' }}>
            <FaDollarSign />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Receita Total</span>
            <span className={styles.metricValue}>R$ 45.231,89</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'var(--lightBlue)' }}>
            <FaTags />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Preço Médio por Venda</span>
            <span className={styles.metricValue}>R$ 42,50</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'var(--softPurple)' }}>
            <FaBoxOpen />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Livros em Estoque</span>
            <span className={styles.metricValue}>1.240</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: 'var(--lightOrange)' }}>
            <FaShoppingCart />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricTitle}>Total de Livros Vendidos</span>
            <span className={styles.metricValue}>342</span>
          </div>
        </div>
      </div>

      <div className={styles.chartCard} style={{ gridColumn: "1 / -1" }}>
        <h3 className={styles.chartTitle}>Receita ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueOverTimeData}>
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
          <BarChart data={revenueByCategoryData} layout="vertical">
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
              data={salesByStateData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {salesByStateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Vendas por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByCategoryData}>
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
          <BarChart data={ratingByCategoryData}>
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
