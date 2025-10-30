import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./StockTable.module.css";
import { FaTrash } from "react-icons/fa";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import AlertModal from "../AlertModal/AlertModal";

const StockTable = () => {
  const [filter, setFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const BOOKS_PER_PAGE = 15; // Define quantos livros serão exibidos por página
  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // Busca os livros do estoque
  const {
    data: books,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stock"],
    // Assumindo que existe um endpoint GET /books para listar o estoque
    queryFn: () => authFetch("/books").then((res) => res.json()),
  });

  // Mutação para deletar um livro
  const { mutate: deleteBook } = useMutation({
    mutationFn: (isbn) => authFetch(`/books/${isbn}`, { method: "DELETE" }),
    onSuccess: () => {
      // Invalida a query do estoque para atualizar a lista
      queryClient.invalidateQueries(["stock"]);
    },
    onError: (err) => {
      console.error("Erro ao deletar livro:", err);
      setAlertMessage("Não foi possível excluir o livro. Tente novamente.");
      setShowAlert(true);
    },
  });

  // Modal state for confirming delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const handleDelete = (book) => {
    // Open modal instead of using window.confirm
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

  // Alert modal state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Reseta para a primeira página sempre que um filtro for alterado
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, authorFilter, categoryFilter, stockLevelFilter]);

  if (isLoading) return <p>Carregando estoque...</p>;
  if (error)
    return <p className="error">Erro ao carregar o estoque: {error.message}</p>;

  // Extrai categorias únicas para o dropdown de filtro
  const allCategories = books
    ? [...new Set(books.flatMap((book) => book.categories || []))].sort()
    : [];

  const filteredBooks = books
    ? books.filter((book) => {
        const filterText = filter.toLowerCase();
        const authorFilterText = authorFilter.toLowerCase();

        // Filtro por título ou ISBN
        const titleIsbnMatch =
          !filterText ||
          book.title.toLowerCase().includes(filterText) ||
          book.isbn.toLowerCase().includes(filterText);

        // Filtro por autor
        const authorFilterMatch =
          !authorFilterText ||
          book.authors?.some((author) =>
            author.toLowerCase().includes(authorFilterText)
          );

        // Filtro por categoria
        const categoryFilterMatch =
          categoryFilter === "all" || book.categories?.includes(categoryFilter);

        // Filtro por quantidade em estoque
        const stockLevelMatch =
          stockLevelFilter === "all" ||
          (stockLevelFilter === "low" &&
            book.totalQuantity >= 1 &&
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

  // Calcula o total de páginas com base nos livros filtrados
  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  // "Fatia" o array de livros filtrados para obter apenas os da página atual
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
            <option value="low">Baixo (1-5)</option>
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
              <th>Ações</th>
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
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleDelete(book)}
                        className={styles.deleteButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
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
      {/* Delete confirmation modal (uses shared ConfirmModal) */}
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
      <AlertModal open={showAlert} onClose={() => setShowAlert(false)} title="Aviso" message={alertMessage} />
    </div>
  );
};

export default StockTable;
