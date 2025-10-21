import os
import re
import requests
from typing import Optional
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
BASE_URL = "https://www.googleapis.com/books/v1/volumes"


def _sanitize_isbn(isbn: str) -> str:
    if not isbn:
        return ""
    cleaned = re.sub(r"[^0-9Xx]", "", str(isbn))
    return cleaned.upper()


def _isbn13_to_isbn10(isbn13: str) -> Optional[str]:
    if not isbn13 or len(isbn13) != 13 or not isbn13.startswith("978"):
        return None
    core9 = isbn13[3:12]  
    if not core9.isdigit():
        return None
    total = 0
    for idx, ch in enumerate(core9):  
        weight = 10 - idx
        total += int(ch) * weight
    remainder = total % 11
    check_val = (11 - remainder) % 11
    check_digit = "X" if check_val == 10 else str(check_val)
    return f"{core9}{check_digit}"


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
        original_isbn = _sanitize_isbn(ISBN)
        if not original_isbn:
            return None

        queries = [f"isbn:{original_isbn}"]
        alt = _isbn13_to_isbn10(original_isbn)
        if alt:
            queries.append(f"isbn:{alt}")

        for query in queries:
            response = requests.get(BASE_URL, params=_build_params(query))
            response.raise_for_status()
            data = response.json() or {}
            items = data.get("items") or []
            if not items:
                continue
            return _normalize_google_volume(ISBN, items[0])
        return None

    except Exception as e:
        print(f"Error fetching book: {str(e)}")
        return None
