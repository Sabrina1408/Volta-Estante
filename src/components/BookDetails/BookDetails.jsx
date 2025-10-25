import styles from './BookDetails.module.css';
import MaturityRating from './MaturityRating';
import { FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';

const BookDetails = ({ book }) => {
  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // O componente não renderiza nada se não houver um livro
  if (!book) {
    return null;
  }

  const { ISBN } = book;

  // Busca as cópias do livro usando o novo endpoint
  const { data: copies, isLoading: isLoadingCopies, error: copiesError } = useQuery({
    queryKey: ['bookCopies', ISBN],
    queryFn: () => authFetch(`/books/${ISBN}/copies`).then(res => res.json()),
    enabled: !!ISBN, // Só executa se o ISBN existir
  });

  // Mutação para registrar a venda de uma cópia
  const { mutate: sellCopy } = useMutation({
    mutationFn: (copyId) => authFetch(`/sales/${ISBN}/${copyId}`, { method: 'POST' }),
    onSuccess: () => {
      // Invalida as queries para atualizar a UI: a lista de cópias e os dados do livro (totalQuantity)
      queryClient.invalidateQueries({ queryKey: ['bookCopies', ISBN] });
      queryClient.invalidateQueries({ queryKey: ['bookSearch', ISBN] });
      alert('Venda registrada com sucesso!');
    },
    onError: (err) => alert(`Erro ao registrar venda: ${err.message}`),
  });

  // Mutação para deletar uma cópia
  const { mutate: deleteCopy } = useMutation({
    mutationFn: (copyId) => authFetch(`/books/${ISBN}/copies/${copyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookCopies', ISBN] });
      queryClient.invalidateQueries({ queryKey: ['bookSearch', ISBN] });
      alert('Cópia excluída com sucesso!');
    },
    onError: (err) => alert(`Erro ao excluir cópia: ${err.message}`),
  });

  const handleSellCopy = (copyId) => {
    if (window.confirm(`Confirmar a venda da cópia ${copyId}?`)) {
      sellCopy(copyId);
    }
  };

  const handleDeleteCopy = (copyId) => {
    if (window.confirm(`Tem certeza que deseja excluir a cópia ${copyId}?`)) {
      deleteCopy(copyId);
    }
  };

  const handleEditCopy = (copyId) => alert(`Editar cópia: ${copyId}`);

  return (
    <div className={styles.bookDetails}>
      {book.thumbnail && <img src={book.thumbnail} alt={`Capa de ${book.title}`} className={styles.thumbnail} />}
      <div className={styles.bookInfo}>
        <h2>{book.title}</h2>
        <p><strong>ISBN:</strong> {book.ISBN}</p>
        {book.authors?.length > 0 && <p><strong>Autor(es):</strong> {book.authors.join(', ')}</p>}
        {book.publisher && <p><strong>Editora:</strong> {book.publisher}</p>}
        {book.publishedDate && <p><strong>Data de Publicação:</strong> {book.publishedDate}</p>}
        {book.categories?.length > 0 && <p><strong>Categorias:</strong> {book.categories.join(', ')}</p>}
        {book.language && <p><strong>Idioma:</strong> {book.language}</p>}
        {book.pageCount > 0 && <p><strong>Número de Páginas:</strong> {book.pageCount}</p>}
        {book.totalQuantity !== undefined && <p><strong>Quantidade em Estoque:</strong> {book.totalQuantity}</p>}
        {book.maturityRating && <p><strong>Classificação Indicativa:</strong> <MaturityRating rating={book.maturityRating} /></p>}
        {book.averageRating > 0 && book.ratingsCount > 0 && (<p><strong>Avaliação Média:</strong> {book.averageRating} (de {book.ratingsCount} avaliações)</p>)}
        {book.description && ( <><h3>Descrição</h3><p>{book.description}</p></> )}
        {book.textSnippet && ( <><h3>Trecho</h3><p><em>{book.textSnippet}</em></p></> )}

        <div className={styles.copiesSection}>
          <h3>Cópias Disponíveis ({book.totalQuantity})</h3>
          {isLoadingCopies && <p>Carregando cópias...</p>}
          {copiesError && <p className="error">Erro ao carregar cópias: {copiesError.message}</p>}
          
          {copies && copies.length > 0 && (
              <table className={styles.copiesTable}>
                <thead>
                  <tr>
                    <th>ID da Cópia</th>
                    <th>Estado</th>
                    <th>Preço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {copies.map((copy) => (
                    <tr key={copy.id}>
                      <td data-label="ID da Cópia">{copy.id}</td>
                      <td data-label="Estado">{copy.conservationState}</td>
                      <td data-label="Preço">{`R$ ${copy.price.toFixed(2).replace('.', ',')}`}</td>
                      <td data-label="Ações">
                        <div className={styles.actions}>
                          <button onClick={() => handleSellCopy(copy.id)} className={styles.sellButton} title="Registrar Venda">
                            <FaDollarSign />
                          </button>
                          <button onClick={() => handleEditCopy(copy.id)} className={styles.editButton} title="Editar Cópia">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteCopy(copy.id)} className={styles.deleteButton} title="Excluir Cópia">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}

          {copies && copies.length === 0 && (
            <p>Não há cópias deste livro em estoque no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;