import styles from "./EditCopyModal.module.css";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";

const EditCopyModal = ({ isOpen, onClose, bookIsbn, copy }) => {
  const [price, setPrice] = useState("");
  const [conservationState, setConservationState] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // Popula o formulário quando o modal abre com uma nova cópia
  useEffect(() => {
    if (copy) {
      setPrice(copy.price || "");
      setConservationState(copy.conservationState || "");
    }
  }, [copy]);

  const { mutate, isLoading } = useMutation({
    mutationFn: (updatedData) =>
      authFetch(`/books/${bookIsbn}/copies/${copy.copyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({
            error: { message: "Erro desconhecido no servidor." },
          }));
          throw new Error(errorData.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess: () => {
      setMessageType("success");
      setMessage("Cópia atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["bookSearch", bookIsbn] });
      // Mantém o estado de 'submitting' até o modal fechar
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (error) => {
      setIsSubmitting(false); // Libera o botão em caso de erro
      setMessageType("error");
      setMessage(error.message || "Ocorreu um erro ao atualizar a cópia.");
      console.error("Erro ao atualizar cópia:", error);
    },
    onSettled: () => {}, // onSettled é chamado após sucesso ou erro
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    setIsSubmitting(true);
    const updatedData = {
      price: parseFloat(price),
      conservationState: conservationState,
    };

    mutate(updatedData);
  };

  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        setIsSubmitting(false); // Reseta o estado de submissão ao fechar
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen || !copy) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
          <FaTimes />
        </button>
        <form onSubmit={handleSubmit} className={styles.editCopyForm}>
          <h2>Editar Cópia do Livro</h2>
          <p><strong>ISBN:</strong> {bookIsbn}</p>
          <p><strong>ID da Cópia:</strong> {copy.copyId}</p>
          {message && <p className={messageType === "error" ? "error" : styles.success}>{message}</p>}
          
          <label htmlFor="price">Preço (R$):</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="Ex: 39.90" step="0.01" />

          <label htmlFor="conservationState">Estado de Conservação:</label>
          <select id="conservationState" value={conservationState} onChange={(e) => setConservationState(e.target.value)} required>
            <option value="" disabled>Selecione um estado</option>
            <option value="Novo">Novo</option>
            <option value="Bom">Bom</option>
            <option value="Mediano">Mediano</option>
            <option value="Péssimo">Péssimo</option>
          </select>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCopyModal;