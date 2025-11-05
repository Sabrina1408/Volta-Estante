import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Trending.module.css";
import Spinner from "../../components/Spinner/Spinner";
import TrendingTable from "../../components/TrendingTable/TrendingTable";

const Trending = () => {
  const { authFetch } = useApi();
  const [subject, setSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(subject);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [subject]);

  const { data: topRatedBooks, isLoading, isError, error } = useQuery({
    queryKey: ["topRatedBooks", searchTerm],
    queryFn: () => authFetch(`/books/topRated?subject=${searchTerm}`).then((res) => res.json()),
    enabled: !!searchTerm,
  });

  if (isLoading) {
    return <div className={styles.centered}><Spinner /></div>;
  }

  if (isError) {
    return <div className={styles.centered}>Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardPage}>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Livros em Alta</h1>
            <p className={styles.subtitle}>Confira os livros mais bem avaliados.</p>
          </div>
        </div>
        <div className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label htmlFor="subject-input">Assunto</label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.filterSelect}
            />
          </div>
        </div>
        <TrendingTable books={topRatedBooks || []} />
      </div>
    </div>
  );
};

export default Trending;
