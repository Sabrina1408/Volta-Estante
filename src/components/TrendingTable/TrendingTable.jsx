import { Link } from "react-router-dom";
import styles from "./TrendingTable.module.css";

const TrendingTable = ({ books }) => {
  if (!books || books.length === 0) {
    return <p>Nenhum livro encontrado.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.stockTable}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor(es)</th>
            <th>Categorias</th>
            <th>ISBN</th>
            <th>Avaliação Média</th>
            <th>Nº de Avaliações</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.ISBN}>
              <td>
                <Link
                  to={`/search?q=${book.ISBN}`}
                  className={styles.titleLink}
                >
                  {book.title}
                </Link>
              </td>
              <td>{book.authors?.join(", ") || "N/A"}</td>
              <td>{book.categories?.join(", ") || "N/A"}</td>
              <td>{book.ISBN}</td>
              <td>{book.averageRating || "N/A"}</td>
              <td>{book.ratingsCount || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendingTable;
