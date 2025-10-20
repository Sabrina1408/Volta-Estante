import styles from './Search.module.css';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const fetchBook = async (query) => {
  const response = await fetch(`http://127.0.0.1:5000/books/${query}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null; // Retorna nulo se o livro não for encontrado, para tratar na UI.
    }
    throw new Error(`Erro na busca (status: ${response.status})`);
  }
  return response.json();
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const { data: book, isLoading, error, isSuccess } = useQuery({
    queryKey: ['bookSearch', query],
    queryFn: () => fetchBook(query),
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
          <p>Autor: {book.author}</p>
          <p>Código: {book.id}</p>
          {/* Adicione mais detalhes do livro conforme necessário */}
        </div>
      )}
       {isSuccess && !book && <p>Nenhum resultado encontrado para "{query}".</p>}
    </div>
  );
}

export default Search;