import styles from './BookDetails.module.css';
import MaturityRating from './MaturityRating';

const BookDetails = ({ book }) => {
  // O componente não renderiza nada se não houver um livro
  if (!book) {
    return null;
  }

  return (
    <div className={styles.bookDetails}>
      {book.thumbnail && <img src={book.thumbnail} alt={`Capa de ${book.title}`} className={styles.thumbnail} />}
      <div className={styles.bookInfo}>
        <h2>{book.title}</h2>
        <p><strong>ISBN:</strong> {book.ISBN}</p>
        {book.authors?.length > 0 && <p><strong>Autor(es):</strong> {book.authors.join(', ')}</p>}
        {book.publisher && <p><strong>Editora:</strong> {book.publisher}</p>}
        {book.publishedDate && <p><strong>Data de Publicação:</strong> {book.publishedDate}</p>}
        {book.categories?.length > 0 && <p><strong>Categorias:</strong> {book.categories.join(', ')}</p>}
        {book.language && <p><strong>Idioma:</strong> {book.language}</p>}
        {book.pageCount > 0 && <p><strong>Número de Páginas:</strong> {book.pageCount}</p>}
        {book.totalQuantity !== undefined && <p><strong>Quantidade em Estoque:</strong> {book.totalQuantity}</p>}
        {book.maturityRating && <p><strong>Classificação Indicativa:</strong> <MaturityRating rating={book.maturityRating} /></p>}
        {book.averageRating > 0 && book.ratingsCount > 0 && (<p><strong>Avaliação Média:</strong> {book.averageRating} (de {book.ratingsCount} avaliações)</p>)}
        {book.description && ( <><h3>Descrição</h3><p>{book.description}</p></> )}
        {book.textSnippet && ( <><h3>Trecho</h3><p><em>{book.textSnippet}</em></p></> )}
      </div>
    </div>
  );
};

export default BookDetails;