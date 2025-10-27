import styles from './Search.module.css';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import BookDetails from '../../components/BookDetails/BookDetails';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { authFetch } = useApi();
  const query = searchParams.get("q")?.trim() || "";

  const { data: book, isLoading, error, isSuccess } = useQuery({
    queryKey: ['bookSearch', query],
    queryFn: async () => {
      const response = await authFetch(`/books/${query}`);
      if (response.status === 404) {
        // Se o livro não for encontrado, retornamos null para indicar que não há dados,
        // mas não é um erro de rede/servidor que o react-query deva tratar como falha.
        // Isso permite que a UI exiba "Nenhum resultado encontrado".
        return null;
      }
      // Se a resposta não for OK (ex: 500 Internal Server Error), lançamos um erro.
      if (!response.ok) throw new Error(`Erro na busca (status: ${response.status})`);
      return response.json();
    },
    enabled: !!query, // A query só será executada se 'query' não for uma string vazia.
  });
  return (
    <div className={styles.search}>
      <h1>Resultados para: {query}</h1>
      {isLoading && query && <p>Carregando...</p>} {/* Apenas mostra carregando se houver uma query */}
      {error && <p className="error">Ocorreu um erro ao buscar o livro: {error.message}</p>}
      {isSuccess && (
        <>
          {book ? (
            <BookDetails book={book} />
          ) : (
            query && <p>Nenhum resultado encontrado para "{query}".</p> // Mostra a mensagem apenas se houver uma query
          )}
        </>
      )}
    </div>
  );
};

export default Search;
//