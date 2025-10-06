import os
import requests
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
BASE_URL = "https://www.googleapis.com/books/v1/volumes"

def fetch_book_by_isbn(isbn):
    params = {
        "q": f"isbn:{isbn}",
        "key": API_KEY
    }
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data.get('items'):
            return None
    
        book_data = data['items'][0]
        volume_info = book_data.get('volumeInfo', {})
        search_info = book_data.get('searchInfo', {})
        # normalizar os dados da api do google
        normalized_data = {
            "isbn": isbn,
            "title": volume_info.get("title"),
            "authors": volume_info.get("authors", []),
            "publisher": volume_info.get("publisher"),
            "categories": volume_info.get("categories", []),
            "publishedDate": volume_info.get("publishedDate"),
            "description": volume_info.get("description"),
            "pageCount": volume_info.get("pageCount"),
            "ratingsCount": volume_info.get("ratingsCount"),
            "averageRating": volume_info.get("averageRating"),
            "thumbnail": volume_info.get("imageLinks", {}).get("thumbnail"),
            "smallThumbnail": volume_info.get("imageLinks", {}).get("smallThumbnail"),
            "language": volume_info.get("language"),
            "maturityRating": volume_info.get("maturityRating"),
            "textSnippet": search_info.get("textSnippet")}
            
        return normalized_data
        
    except Exception as e:
        print(f"Error fetching book: {str(e)}")
        return None
