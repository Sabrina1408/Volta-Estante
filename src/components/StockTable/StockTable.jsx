import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./StockTable.module.css";
import {
  FaFilter,
  FaLayerGroup,
  FaPencilAlt,
  FaTrash,
} from "react-icons/fa";

const StockTable = () => {
  const [filter, setFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
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
    mutationFn: (isbn) =>
      authFetch(`/books/${isbn}`, { method: "DELETE" }),
    onSuccess: () => {
      // Invalida a query do estoque para atualizar a lista
      queryClient.invalidateQueries(["stock"]);
    },
    onError: (err) => {
      console.error("Erro ao deletar livro:", err);
      alert("Não foi possível excluir o livro. Tente novamente.");
    },
  });

  const handleDelete = (isbn) => {
    if (window.confirm("Tem certeza que deseja excluir este livro e todas as suas cópias? Esta ação não pode ser desfeita.")) {
      deleteBook(isbn);
    }
  };

  const handleEdit = (book) => {
    // Lógica para abrir um modal de edição.
    // Por enquanto, apenas um alerta.
    alert(`Funcionalidade de edição para o livro "${book.title}" a ser implementada.`);
  };

  if (isLoading) return <p>Carregando estoque...</p>;
  if (error) return <p className="error">Erro ao carregar o estoque: {error.message}</p>;

  // Extrai categorias únicas para o dropdown de filtro
  const allCategories = books
    ? [...new Set(books.flatMap((book) => book.categories || []))].sort()
    : [];

  const filteredBooks = books
    ? books.filter((book) => {
        const filterText = filter.toLowerCase();
        const authorFilterText = authorFilter.toLowerCase();


        // Filtro por autor
        const authorFilterMatch =
          !authorFilterText ||
          book.authors?.some((author) => author.toLowerCase().includes(authorFilterText));

        // Filtro por categoria
        const categoryFilterMatch =
          categoryFilter === "all" || book.categories?.includes(categoryFilter);

        // Filtro por nível de estoque
        const stockLevelMatch = stockLevelFilter === "all" ||
          (stockLevelFilter === "low" && book.totalQuantity >= 1 && book.totalQuantity <= 5) ||
          (stockLevelFilter === "medium" && book.totalQuantity >= 6 && book.totalQuantity <= 10) ||
          (stockLevelFilter === "high" && book.totalQuantity > 10);

        return authorFilterMatch && categoryFilterMatch && stockLevelMatch;
      })
    : [];

  return (
    <div className={styles.stockContainer}>
      <div className={styles.filterControls}>
        <input
          type="text"
          placeholder="Filtrar por Título ou ISBN..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="text"
          placeholder="Filtrar por autor..."
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className={styles.filterInput}
        />
        <div className={styles.selectWrapper}>
          <FaFilter className={styles.selectIcon} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
            <option value="all">Categorias</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selectWrapper}>
          <FaLayerGroup className={styles.selectIcon} />
          <select value={stockLevelFilter} onChange={(e) => setStockLevelFilter(e.target.value)} className={styles.filterSelect}>
            <option value="all">Quantidade</option>
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
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr key={book.isbn}>
                  <td>
                    <Link to={`/search?q=${book.isbn}`} className={styles.titleLink}>
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
                        onClick={() => handleEdit(book)}
                        className={styles.editButton}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleDelete(book.ISBN)}
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
                <td colSpan="6">Nenhum livro encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;