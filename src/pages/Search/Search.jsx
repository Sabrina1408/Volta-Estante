import styles from './Search.module.css';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q").trim();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /* const fetchFromApi = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/books/${search}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApiMessage(`API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Error fetching from API:", error);
      setApiMessage(`Error connecting to API: ${error.message}`);
    }
  }; */

  useEffect(() => {
    const fetchFromApi = async () => {
      setLoading(true);
      setError(null);
      setBook(null);
      try {
        const response = await fetch(`http://127.0.0.1:5000/books/${query}`);
        if (!response.ok) {
          throw new Error(`Livro não encontrado ou erro na busca (status: ${response.status})`);
        }
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Error fetching from API:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchFromApi();
    } else {
        setLoading(false);
    }
  }, [query]); // A busca é refeita sempre que o 'query' mudar

  return (
    <div className={styles.search}>
      <h1>Resultados para: {query}</h1>
      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {book && (
        <div>
          <h2>{book.title}</h2>
          <p>Autor: {book.author}</p>
          <p>Código: {book.id}</p>
          {/* Adicione mais detalhes do livro conforme necessário */}
        </div>
      )}
       {!book && !loading && !error && <p>Nenhum resultado encontrado.</p>}
    </div>
  );
}

export default Search;