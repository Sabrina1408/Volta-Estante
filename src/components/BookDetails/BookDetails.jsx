import styles from './BookDetails.module.css';
import MaturityRating from './MaturityRating';
import { FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';

const BookDetails = ({ book }) => {
  const { authFetch } = useApi();
  const queryClient = useQueryClient();
  
  if (!book) {
    return null;
  }

  const { isbn, copies } = book;

  // Mutação para registrar a venda de uma cópia
  const { mutate: sellCopy } = useMutation({
    mutationFn: (copyId) => authFetch(`/sales/${isbn}/${copyId}`, { method: 'POST' }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: { message: "Erro desconhecido no servidor." },
          }));
          throw new Error(errorData.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess: () => {
      // Invalida as queries para atualizar a UI: a lista de cópias e os dados do livro (totalQuantity)
      // A query 'bookSearch' já contém as cópias, invalidá-la é suficiente.
      queryClient.invalidateQueries({ queryKey: ['bookSearch', isbn] }); // Invalida a busca para atualizar o objeto 'book' completo
      alert('Venda registrada com sucesso!');
    },
    onError: (err) => alert(`Erro ao registrar venda: ${err.message}`),
  });

  // Mutação para deletar uma cópia
  const { mutate: deleteCopy } = useMutation({
    mutationFn: (copyId) => authFetch(`/books/${isbn}/copies/${copyId}`, { method: 'DELETE' }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: { message: "Erro desconhecido no servidor." },
          }));
          throw new Error(errorData.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess: () => {
      // A query 'bookSearch' já contém as cópias, invalidá-la é suficiente.
      queryClient.invalidateQueries({ queryKey: ['bookSearch', isbn] }); // Invalida a busca para atualizar o objeto 'book' completo
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
        <p><strong>ISBN:</strong> {book.isbn}</p>
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
          {copies?.length > 0 ? (
              <div className={styles.tableWrapper}>
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
                        <td data-label="ID da Cópia">{copy.copyId}</td>
                        <td data-label="Estado">{copy.conservationState}</td>
                        <td data-label="Preço">{`R$ ${copy.price.toFixed(2).replace('.', ',')}`}</td>
                        <td data-label="Ações">
                          <div className={styles.actions}>
                            <button onClick={() => handleSellCopy(copy.copyId)} className={styles.saleButton} title="Registrar Venda">
                              <FaDollarSign />
                            </button>
                            <button onClick={() => handleEditCopy(copy.copyId)} className={styles.editButton} title="Editar Cópia">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteCopy(copy.copyId)} className={styles.deleteButton} title="Excluir Cópia">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <p>Não há cópias deste livro em estoque no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default BookDetails;