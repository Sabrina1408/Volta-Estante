import styles from "./AddBookModal.module.css";
import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { getFriendlyFirebaseError } from "../../utils/firebaseErrors";

const AddBookModal = ({ isOpen, onClose }) => {
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [conservationState, setConservationState] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newBook) =>
      authFetch("/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    onSuccess: (data) => {
      setMessageType("success");
      setMessage(`Livro "${data.title}" adicionado com sucesso!`);
      setIsbn("");
      setPrice("");
      setConservationState("");
      // Invalida queries relacionadas ao estoque para que os dados sejam atualizados
      queryClient.invalidateQueries(["stock"]);
      setTimeout(() => {
        onClose(); // Fecha o modal após um curto período de sucesso
      }, 1500);
    },
    onError: (error) => {
      const friendlyError = getFriendlyFirebaseError(
        error.code,
        error.message || "Ocorreu um erro ao adicionar o livro."
      );
      setMessageType("error");
      setMessage(friendlyError);
      console.error("Erro ao adicionar livro:", error);
    },
  });

  // Prevenir múltiplos cliques no botão de envio
  const submittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se já está enviando para evitar múltiplos cliques
    if (submittingRef.current) return;
    submittingRef.current = true;

    setMessage("");
    setMessageType("");

    const bookData = {
      ISBN: isbn,
      price: parseFloat(price),
      conservationState: conservationState,
    };

    try {
      // Valida os campos antes de enviar
      await mutateAsync(bookData);
    } catch (err) {

      console.error("Erro na submissão do livro:", err);
    } finally {
      submittingRef.current = false;
    }
  };

  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        setIsbn("");
        setPrice("");
        setConservationState("");
      }, 300); // Aguarda a animação de fechamento
    }
  }, [isOpen]);

  // Fecha o modal ao pressionar Esc
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
