import styles from './Search.module.css';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { authFetch } = useApi();
  const query = searchParams.get("q")?.trim() || "";

  const { data: book, isLoading, error, isSuccess } = useQuery({
    queryKey: ['bookSearch', query],
    queryFn: async () => {
      const response = await authFetch(`/books/${query}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Erro na busca (status: ${response.status})`);
      return response.json();
    },
    enabled: !!query, // A query só será executada se 'query' não for uma string vazia.
  });

  return (
    <div className={styles.search}>
      <h1>Resultados para: {query}</h1>
      {isLoading && <p>Carregando...</p>}
      {error && <p className="error">Ocorreu um erro: {error.message}</p>}
      {book && (
        <div>
          <h2>{book.title}</h2>
          <p>Autor: {book.authors}</p>
          <p>Código: {book.id}</p>
          <p>Descrição: {book.description}</p>
          {/* Adicione mais detalhes do livro conforme necessário */}
        </div>
      )}
       {isSuccess && !book && <p>Nenhum resultado encontrado para "{query}".</p>}
    </div>
  );
}

export default Search;