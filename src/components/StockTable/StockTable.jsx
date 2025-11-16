import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import styles from "./StockTable.module.css";
import { FaTrash, FaPlus } from "react-icons/fa";
import QuickAddCopyModal from "../QuickAddCopyModal/QuickAddCopyModal";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import AlertModal from "../AlertModal/AlertModal";
import { getFriendlyError } from "../../utils/errorMessages";

const StockTable = () => {
  const [filter, setFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const BOOKS_PER_PAGE = 15;
  const { authFetch } = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: books,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stock"],

    queryFn: () => authFetch("/books").then((res) => res.json()),
  });

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

  const { mutate: deleteBook } = useMutation({
    mutationFn: async (isbn) => {
      const res = await authFetch(`/books/${isbn}`, { method: "DELETE" });
      if (!res.ok) throw new Error('BOOK_DELETE_FAILED');
      if (res.status === 204) return null;
      return await res.json().catch(() => null);
    },
    onSuccess: () => {

      queryClient.invalidateQueries(["stock"]);
    },
    onError: (err) => {
      console.error("Erro ao deletar livro:", err);
      setAlertMessage(getFriendlyError('BOOK_DELETE_FAILED'));
      setShowAlert(true);
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const handleDelete = (book) => {

    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!bookToDelete) return;
    deleteBook(bookToDelete.isbn);
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddBook, setQuickAddBook] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, authorFilter, categoryFilter, stockLevelFilter]);

  if (isLoading || isLoadingProfile) return <p>Carregando estoque...</p>;
  if (error)
    return <p className="error">{getFriendlyError('STOCK_LOAD_FAILED')}</p>;

  const allCategories = books
    ? [...new Set(books.flatMap((book) => book.categories || []))].sort()
    : [];

  const filteredBooks = books
    ? books.filter((book) => {
        const filterText = filter.toLowerCase();
        const authorFilterText = authorFilter.toLowerCase();

        const titleIsbnMatch =
          !filterText ||
          book.title.toLowerCase().includes(filterText) ||
          book.isbn.toLowerCase().includes(filterText);

        const authorFilterMatch =
          !authorFilterText ||
          book.authors?.some((author) =>
            author.toLowerCase().includes(authorFilterText)
          );

        const categoryFilterMatch =
          categoryFilter === "all" || book.categories?.includes(categoryFilter);

        const stockLevelMatch =
          stockLevelFilter === "all" ||
          (stockLevelFilter === "low" &&
            book.totalQuantity >= 0 &&
            book.totalQuantity <= 5) ||
          (stockLevelFilter === "medium" &&
            book.totalQuantity >= 6 &&
            book.totalQuantity <= 10) ||
          (stockLevelFilter === "high" && book.totalQuantity > 10);

        return (
          titleIsbnMatch &&
          authorFilterMatch &&
          categoryFilterMatch &&
          stockLevelMatch
        );
      })
    : [];

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  return (
    <div className={styles.stockContainer}>
      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <label htmlFor="title-isbn-filter">Título ou ISBN</label>
          <input
            id="title-isbn-filter"
            type="text"
            placeholder="Filtrar por Título ou ISBN..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="author-filter">Autor</label>
          <input
            id="author-filter"
            type="text"
            placeholder="Filtrar por autor..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="category-filter">Categorias</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas as categorias</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="stock-level-filter">Quantidade</label>
          <select
            id="stock-level-filter"
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas</option>
            <option value="low">Baixo (0-5)</option>
            <option value="medium">Médio (6-10)</option>
            <option value="high">Alto (&gt;10)</option>
          </select>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.stockTable}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor(es)</th>
              <th>Categorias</th>
              <th>ISBN</th>
              <th>Quantidade</th>
              {!isReader && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.length > 0 ? (
              paginatedBooks.map((book) => (
                <tr key={book.isbn}>
                  <td>
                    <Link
                      to={`/search?q=${book.isbn}`}
                      className={styles.titleLink}
                    >
                      {book.title}
                    </Link>
                  </td>
                  <td>{book.authors?.join(", ") || "N/A"}</td>
                  <td>{book.categories?.join(", ") || "N/A"}</td>
                  <td>{book.isbn}</td>
                  <td>{book.totalQuantity}</td>
                  {!isReader && (
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => {
                            setQuickAddBook(book);
                            setShowQuickAdd(true);
                          }}
                          title="Adicionar cópia"
                          className={styles.quickAddButton}
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={() => handleDelete(book)}
                          className={styles.deleteButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isReader ? "5" : "6"}>
                  Nenhum livro encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      )}
      <ConfirmModal
        open={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        message={
          bookToDelete
            ? `Tem certeza que deseja excluir "${bookToDelete.title || bookToDelete.isbn}" e todas as suas cópias? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir este livro e todas as suas cópias? Esta ação não pode ser desfeita."
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
      <QuickAddCopyModal
        isOpen={showQuickAdd}
        onClose={() => {
          setShowQuickAdd(false);
          setQuickAddBook(null);
        }}
        book={quickAddBook}
      />
      <AlertModal open={showAlert} onClose={() => setShowAlert(false)} title="Aviso" message={alertMessage} />
    </div>
  );
};

export default StockTable;