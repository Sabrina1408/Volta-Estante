# Manual Book Addition Endpoint

## Overview
The `/books/manual` endpoint allows you to add books manually to your sebo's inventory without relying on the Google Books API. This is useful when:
- The book is not found in the Google Books database
- The Google Books API returns incorrect or incomplete data
- You want to add a very old or rare book with custom information

## Endpoint Details
- **URL**: `POST /books/manual`
- **Authentication**: Required (Bearer token)
- **Permissions**: Admin or Editor roles
- **Content-Type**: `application/json`

## Request Body

### Required Fields
- `ISBN` (string): The book's ISBN-13 (will be sanitized automatically)
- `title` (string): The book's title
- `price` (number): Price of the copy
- `conservationState` (string): Physical condition of the copy (NEW, GOOD, FAIR, or POOR)

### Optional Fields
- `language` (string): Language code (e.g., "pt", "en", "es")
- `authors` (array of strings): List of authors
- `publisher` (string): Publisher name
- `categories` (array of strings): Book categories/genres
- `publishedDate` (string): Publication date
- `description` (string): Book description
- `pageCount` (integer): Number of pages
- `thumbnail` (string): URL to cover image
- `smallThumbnail` (string): URL to small cover image
- `maturityRating` (string): Age rating

## Example Request

```bash
curl -X POST http://localhost:5000/books/manual \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "ISBN": "9788535932423",
    "title": "Dom Casmurro",
    "language": "pt",
    "authors": ["Machado de Assis"],
    "publisher": "Companhia das Letras",
    "categories": ["Ficção", "Literatura Brasileira"],
    "publishedDate": "1899",
    "description": "Romance escrito por Machado de Assis que narra a história de Bentinho e Capitu.",
    "pageCount": 256,
    "price": 25.90,
    "conservationState": "GOOD"
  }'
```

## Example Response (201 Created)

```json
{
  "ISBN": "9788535932423",
  "title": "Dom Casmurro",
  "message": "Book added manually successfully"
}
```

## Error Responses

### 400 Bad Request - Missing Required Field
```json
{
  "error": "Missing required field: title"
}
```

### 400 Bad Request - Invalid ISBN
```json
{
  "error": "Invalid book data: Missing or invalid ISBN-13"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: insufficient permissions"
}
```

### 404 Not Found - Sebo doesn't exist
```json
{
  "error": "Sebo with ID {sebo_id} not found"
}
```

## JavaScript/Frontend Example

```javascript
async function addBookManually(bookData) {
  try {
    const response = await fetch('http://localhost:5000/books/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ISBN: bookData.isbn,
        title: bookData.title,
        price: bookData.price,
        conservationState: bookData.conservationState, // Required: NEW, GOOD, FAIR, or POOR
        language: bookData.language || null,
        authors: bookData.authors || [],
        publisher: bookData.publisher || null,
        categories: bookData.categories || [],
        publishedDate: bookData.publishedDate || null,
        description: bookData.description || null,
        pageCount: bookData.pageCount || null,
        thumbnail: bookData.thumbnail || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add book manually');
    }

    const result = await response.json();
    console.log('Book added:', result);
    return result;
  } catch (error) {
    console.error('Error adding book manually:', error);
    throw error;
  }
}

// Usage example
addBookManually({
  isbn: '9788535932423',
  title: 'Dom Casmurro',
  price: 25.90,
  conservationState: 'GOOD', // Required: NEW, GOOD, FAIR, or POOR
  language: 'pt',
  authors: ['Machado de Assis'],
  publisher: 'Companhia das Letras',
  categories: ['Ficção', 'Literatura Brasileira'],
  publishedDate: '1899',
  description: 'Romance escrito por Machado de Assis...',
  pageCount: 256
});
```

## Notes

1. **ISBN Validation**: The ISBN will be automatically sanitized (removing hyphens and spaces) and validated to ensure it's 13 digits.

2. **Duplicate Books**: If a book with the same ISBN already exists in your sebo, the system will add a new copy to the existing book record instead of creating a duplicate book entry.

3. **Inventory Tracking**: The `totalQuantity` field in the book document is automatically incremented when adding copies.

4. **Audit Log**: This action is automatically logged with the description "Adicionar Livro Manualmente" for audit purposes.

5. **Model Validation**: All book data is validated against the Book and Copy Pydantic models before being saved to ensure data integrity.
