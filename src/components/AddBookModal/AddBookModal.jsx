import styles from "./AddBookModal.module.css";
import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { getFriendlyError } from "../../utils/errorMessages";

const AddBookModal = ({ isOpen, onClose }) => {
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [conservationState, setConservationState] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [title, setTitle] = useState("");
  const [authorsInput, setAuthorsInput] = useState("");
  const [publisher, setPublisher] = useState("");
  const [categoriesInput, setCategoriesInput] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [description, setDescription] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [language, setLanguage] = useState("");
  const [maturityRating, setMaturityRating] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [smallThumbnail, setSmallThumbnail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  const onSuccess = (data) => {
    setMessageType("success");
    setMessage(`Livro "${data.title}" adicionado com sucesso!`);
    setIsbn("");
    setPrice("");
    setConservationState("");
    setManualMode(false);
    setTitle("");
    setAuthorsInput("");
    setPublisher("");
    setCategoriesInput("");
    setPublishedDate("");
    setDescription("");
    setPageCount("");
    setLanguage("");
    setMaturityRating("");
    setThumbnail("");
    setSmallThumbnail("");

    queryClient.invalidateQueries(["stock"]);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const onError = (error) => {
    let rawMsg = error.message || "";
    let friendlyError;
    if (/not found via Google Books API/i.test(rawMsg)) {
      const match = rawMsg.match(/ISBN\s+(\S+)/i);
      const isbnNotFound = match ? match[1] : isbn;
      friendlyError = `O Livro com a ISBN ${isbnNotFound} não foi encontrado na API do Google Books.`;
    } else {
      friendlyError = getFriendlyError(
        error.code,
        rawMsg || "Ocorreu um erro ao adicionar o livro."
      );
    }
    setMessageType("error");
    setMessage(friendlyError);
    console.error("Erro ao adicionar livro:", error);
  };

  const addByIsbnMutation = useMutation({
    mutationFn: (newBook) =>
      authFetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: { message: "Erro desconhecido no servidor." },
          }));
          throw new Error(errorData.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess,
    onError,
  });

  const addManualMutation = useMutation({
    mutationFn: (manualBody) =>
      authFetch("/books/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualBody),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: { message: "Erro desconhecido no servidor." },
          }));
          throw new Error(errorData.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess,
    onError,
  });

  const isLoading = addByIsbnMutation.isLoading || addManualMutation.isLoading;

  const submittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;

    setMessage("");
    setMessageType("");

    try {
      if (manualMode) {
        if (!title) {
          setMessageType("error");
          setMessage("Título é obrigatório no cadastro manual.");
          return;
        }
        const manualBody = {
          ISBN: isbn,
          title: title,
          language: language || undefined,
          authors: authorsInput
            ? authorsInput.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          publisher: publisher || undefined,
          categories: categoriesInput
            ? categoriesInput.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          publishedDate: publishedDate || undefined,
          description: description || undefined,
          pageCount: pageCount ? parseInt(pageCount, 10) : undefined,
          thumbnail: thumbnail || undefined,
          smallThumbnail: smallThumbnail || undefined,
          maturityRating: maturityRating || undefined,
          conservationState: conservationState,
          price: parseFloat(price),
        };

        await addManualMutation.mutateAsync(manualBody);
      } else {
        const bookData = {
          ISBN: isbn,
          price: parseFloat(price),
          conservationState: conservationState,
        };
        await addByIsbnMutation.mutateAsync(bookData);
      }
    } catch (err) {
      console.error("Erro na submissão do livro:", err);
    } finally {
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        setIsbn("");
        setPrice("");
        setConservationState("");
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes />
        </button>
        <form onSubmit={handleSubmit} className={styles.addBookForm}>
          <h2>Adicionar Novo Livro/Cópia</h2>
          {message && (
            <p className={messageType === "error" ? "error" : styles.success}>
              {message}
            </p>
          )}
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
            placeholder="Ex: 9788532530837"
          />

          <div className={styles.manualToggleRow}>
            <label htmlFor="manualMode">Cadastrar manualmente?</label>
            <input
              id="manualMode"
              type="checkbox"
              checked={manualMode}
              onChange={(e) => setManualMode(e.target.checked)}
            />
          </div>

          <label htmlFor="price">Preço (R$):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Ex: 39.90"
            step="0.01"
          />

          {manualMode && (
            <>
              <label htmlFor="title">Título:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Título do livro"
              />

              <label htmlFor="authors">Autores (separar por vírgula):</label>
              <input
                type="text"
                id="authors"
                value={authorsInput}
                onChange={(e) => setAuthorsInput(e.target.value)}
                placeholder="Autor1, Autor2"
              />

              <label htmlFor="publisher">Editora:</label>
              <input
                type="text"
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Editora"
              />

              <label htmlFor="categories">Categorias (separar por vírgula):</label>
              <input
                type="text"
                id="categories"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                placeholder="Ficção, Romance"
              />

              <label htmlFor="publishedDate">Data de Publicação:</label>
              <input
                type="text"
                id="publishedDate"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                placeholder="YYYY-MM-DD ou ano"
              />

              <label htmlFor="pageCount">Número de Páginas:</label>
              <input
                type="number"
                id="pageCount"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="Ex: 320"
              />

              <label htmlFor="language">Idioma:</label>
              <input
                type="text"
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="pt, en"
              />

              <label htmlFor="maturityRating">Maturity Rating:</label>
              <input
                type="text"
                id="maturityRating"
                value={maturityRating}
                onChange={(e) => setMaturityRating(e.target.value)}
                placeholder="EX: NOT_MATURE"
              />

              <label htmlFor="thumbnail">Thumbnail URL:</label>
              <input
                type="text"
                id="thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="URL da imagem"
              />

              <label htmlFor="smallThumbnail">Small Thumbnail URL:</label>
              <input
                type="text"
                id="smallThumbnail"
                value={smallThumbnail}
                onChange={(e) => setSmallThumbnail(e.target.value)}
                placeholder="URL da imagem pequena"
              />

              <label htmlFor="description">Descrição:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do livro"
              />
            </>
          )}

          <label htmlFor="conservationState">Estado de Conservação:</label>
          <select
            id="conservationState"
            value={conservationState}
            onChange={(e) => setConservationState(e.target.value)}
            required
          >
            <option value="" disabled>
              Selecione um estado
            </option>
            <option value="Novo">Novo</option>
            <option value="Bom">Bom</option>
            <option value="Mediano">Mediano</option>
            <option value="Péssimo">Péssimo</option>
          </select>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Adicionando..." : "Adicionar ao Estoque"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;