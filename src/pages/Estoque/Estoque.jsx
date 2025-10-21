import styles from "./Estoque.module.css";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import { getFriendlyFirebaseError } from "../../utils/firebaseErrors";

const Estoque = () => {
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [conservationState, setConservationState] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const { authFetch } = useApi();

  const { mutate, isLoading } = useMutation({
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
    },
    onError: (error) => {
      const friendlyError = getFriendlyFirebaseError(error.code, error.message || "Ocorreu um erro ao adicionar o livro.");
      setMessageType("error");
      setMessage(friendlyError);
      console.error("Erro ao adicionar livro:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const bookData = {
      ISBN: isbn,
      price: parseFloat(price),
      conservationState: conservationState,
    };

    mutate(bookData);
  };

  return (
    <div className={styles.estoque}>
      <h1>Estoque</h1>

      <form onSubmit={handleSubmit} className={styles.addBookForm}>
        <h2>Adicionar Novo Livro/Cópia</h2>
        {message && <p className={messageType === 'error' ? 'error' : styles.success}>{message}</p>}
        <label htmlFor="isbn">ISBN:</label>
        <input type="text" id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} required placeholder="Ex: 9788532530837" />

        <label htmlFor="price">Preço (R$):</label>
        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="Ex: 39.90" step="0.01" />

        <label htmlFor="conservationState">Estado de Conservação:</label>
        <input type="text" id="conservationState" value={conservationState} onChange={(e) => setConservationState(e.target.value)} required placeholder="Ex: Ótimo estado" />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Adicionando..." : "Adicionar ao Estoque"}
        </button>
      </form>
    </div>
  );
};

export default Estoque;
