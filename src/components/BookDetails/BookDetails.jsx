import { useState } from 'react';
import styles from './BookDetails.module.css';
import MaturityRating from './MaturityRating';
import { FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import EditCopyModal from '../EditCopyModal/EditCopyModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import AlertModal from '../AlertModal/AlertModal';
import { getFriendlyError } from '../../utils/errorMessages';

const BookDetails = ({ book }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const { authFetch } = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      const res = await authFetch(`/users/${user.uid}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar os dados do perfil.");
      }
      return res.json();
    },
    enabled: !!user,
  });

  const isReader = profileData?.userRole === "Reader";

  if (!book || isLoadingProfile) {
    return null;
  }

  const { isbn, copies } = book;

  const sortedCopies = copies?.length > 0 
    ? [...copies].sort((a, b) => {
        const dateA = a.registeredAt || '';
        const dateB = b.registeredAt || '';
        return dateA.localeCompare(dateB);
      })
    : [];

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

      queryClient.invalidateQueries({ queryKey: ['bookSearch', isbn] });
      setAlertMessage(getFriendlyError('SALE_REGISTER_SUCCESS'));
      setAlertOpen(true);
    },
    onError: (err) => {
  setAlertMessage(getFriendlyError('SALE_REGISTER_FAILED'));
      setAlertOpen(true);
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['bookSearch', isbn] });
      setAlertMessage(getFriendlyError('COPY_DELETE_SUCCESS'));
      setAlertOpen(true);
    },
    onError: (err) => {
  setAlertMessage(getFriendlyError('COPY_DELETE_FAILED'));
      setAlertOpen(true);
    },
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const handleSellCopy = (copyId) => {
    setConfirmMessage(`Confirmar a venda da cópia ${copyId}?`);
    setConfirmAction(() => () => sellCopy(copyId));
    setConfirmOpen(true);
  };

  const handleDeleteCopy = (copyId) => {
    setConfirmMessage(`Tem certeza que deseja excluir a cópia ${copyId}?`);
    setConfirmAction(() => () => deleteCopy(copyId));
    setConfirmOpen(true);
  };

  const handleEditCopy = (copy) => {
    setSelectedCopy(copy);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className={styles.bookDetails}>
        <div className={styles.bookInfo}>
          <div className={styles.infoHeader}>
            <div className={styles.infoMain}>
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
            </div>

            {book.thumbnail && (
              <div className={styles.thumbColumn}>
                <img src={book.thumbnail} alt={`Capa de ${book.title}`} className={styles.thumbnail} />
              </div>
            )}
          </div>

          {book.description && ( <><h3>Descrição</h3><p>{book.description}</p></> )}
          {book.textSnippet && ( <><h3>Trecho</h3><p><em>{book.textSnippet}</em></p></> )}

          <div className={styles.copiesSection}>
            <h3>Cópias Disponíveis ({book.totalQuantity})</h3>
            {sortedCopies?.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.copiesTable}>
                    <thead>
                      <tr>
                        <th>ID da Cópia</th>
                        <th>Estado</th>
                        <th>Preço</th>
                        {!isReader && <th>Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCopies.map((copy) => (
                        <tr key={copy.copyId}>
                          <td data-label="ID da Cópia">{copy.copyId}</td>
                          <td data-label="Estado">{copy.conservationState}</td>
                          <td data-label="Preço">{`R$ ${copy.price.toFixed(2).replace('.', ',')}`}</td>
                          {!isReader && (
                            <td data-label="Ações">
                              <div className={styles.actions}>
                                <button onClick={() => handleSellCopy(copy.copyId)} className={styles.saleButton} title="Registrar Venda">
                                  <FaDollarSign />
                                </button>
                                <button onClick={() => handleEditCopy(copy)} className={styles.editButton} title="Editar Cópia">
                                  <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteCopy(copy.copyId)} className={styles.deleteButton} title="Excluir Cópia">
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          )}
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
      <EditCopyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bookIsbn={isbn}
        copy={selectedCopy}
      />
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} title="Aviso" message={alertMessage} />
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          confirmAction();
          setConfirmOpen(false);
        }}
        title="Confirmação"
        message={confirmMessage}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  );
};
export default BookDetails;