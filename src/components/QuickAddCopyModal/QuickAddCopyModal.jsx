import styles from "./QuickAddCopyModal.module.css";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import Modal from "../Modal/Modal";

const QuickAddCopyModal = ({ isOpen, onClose, book }) => {
  const [price, setPrice] = useState("");
  const [conservationState, setConservationState] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // Fetch full book data (to try to prefill from last copy)
  const { data: bookDetails } = useQuery({
    queryKey: ["bookSearch", book?.isbn],
    queryFn: () => authFetch(`/books/${book.isbn}`).then((res) => res.json()),
    enabled: !!isOpen && !!book?.isbn
  });

  useEffect(() => {
    if (bookDetails && bookDetails.copies && bookDetails.copies.length > 0) {
      // Sort copies by registered_at if available, fallback to array order
      const sorted = [...bookDetails.copies].sort((a, b) => {
        if (a.registeredAt && b.registeredAt) {
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        }
        return 0;
      });
      const last = sorted[0];
      setPrice(last.price ?? "");
      setConservationState(last.conservationState ?? "");
    } else {
      setPrice("");
      setConservationState("");
    }
  }, [bookDetails, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessage("");
        setIsSubmitting(false);
      }, 200);
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

  const { mutate } = useMutation({
    mutationFn: (payload) =>
      authFetch("/books/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `Erro ${res.status}`);
        }
        return res.json();
      }),
    onSuccess: () => {
      setMessage("Cópia adicionada com sucesso!");
      queryClient.invalidateQueries(["stock"]);
      queryClient.invalidateQueries(["bookSearch", book?.isbn]);
      setTimeout(() => onClose(), 1000);
    },
    onError: (err) => {
      setMessage(err.message || "Erro ao adicionar cópia.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e) => {
    e && e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      ISBN: book.isbn,
      title: book.title || "",
      price: parseFloat(price),
      conservationState: conservationState || "Bom",
      authors: book.authors || [],
      categories: book.categories || [],
    };

    mutate(payload);
  };

  if (!isOpen || !book) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Adicionar Cópia</h3>
        <p className={styles.bookInfo}>
          <strong>Livro:</strong> {book.title} ({book.isbn})
        </p>

        {message && <p className={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="price">Preço (R$):</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Ex: 39.90"
          />

          <label htmlFor="conservation">Estado de Conservação:</label>
          <select id="conservation" value={conservationState} onChange={(e) => setConservationState(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="Novo">Novo</option>
            <option value="Bom">Bom</option>
            <option value="Mediano">Mediano</option>
            <option value="Péssimo">Péssimo</option>
          </select>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submit} disabled={isSubmitting}>{isSubmitting ? 'Adicionando...' : 'Adicionar ao Estoque'}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuickAddCopyModal;
