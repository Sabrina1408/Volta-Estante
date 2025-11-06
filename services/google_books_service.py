import os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from services.isbn_utils import sanitize_isbn


load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
BASE_URL = "https://www.googleapis.com/books/v1/volumes"


def _build_params(query: str) -> dict:
    params = {
        "q": query,
        "printType": "books",
        "maxResults": 5,
    }
    if API_KEY:
        params["key"] = API_KEY
    return params


def _normalize_google_volume(ISBN: str, book_data: dict) -> dict:
    volume_info = book_data.get("volumeInfo", {})
    search_info = book_data.get("searchInfo", {})
    return {
        "ISBN": ISBN,
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
        "textSnippet": search_info.get("textSnippet"),
    }


def fetch_book_by_isbn(ISBN: str):
    try:
        original_isbn = sanitize_isbn(ISBN)
        if not original_isbn or len(original_isbn) != 13:
            return None

        query = f"isbn:{original_isbn}"
        response = requests.get(BASE_URL, params=_build_params(query))
        response.raise_for_status()
        data = response.json() or {}
        items = data.get("items") or []
        if not items:
            return None
        return _normalize_google_volume(ISBN, items[0])

    except Exception as e:
        print(f"Error fetching book: {str(e)}")
        return None


def _extract_isbn_from_volume(volume: dict) -> str:
    """Return an ISBN (prefer ISBN_13) from a Google Books volume or None."""
    volume_info = volume.get("volumeInfo", {})
    identifiers = volume_info.get("industryIdentifiers", []) or []
    isbn_13 = None
    isbn_any = None
    for ident in identifiers:
        id_type = ident.get("type")
        identifier = ident.get("identifier")
        if not identifier:
            continue
        if id_type == "ISBN_13":
            isbn_13 = identifier
            break
        if not isbn_any:
            isbn_any = identifier
    return isbn_13 or isbn_any
