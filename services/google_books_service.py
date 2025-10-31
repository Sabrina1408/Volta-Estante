import os
import requests
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


def fetch_top_rated_books(
    queries=None,
    subjects=None,
    max_results: int = 10,
    min_ratings: int = 5,
    per_request: int = 40,
    pages: int = 1,
) -> list:
    """Fetch books for multiple queries/subjects and return the top-rated books.

    This function accepts a single string or an iterable of strings for
    `queries` and `subjects`. It will fetch `pages` pages per target (query or
    subject), each page requesting up to `per_request` items (clamped to 1..40),
    then merge, deduplicate (by ISBN), filter and sort client-side by
    `averageRating` and `ratingsCount`.

    Args:
        queries: string or iterable of free-text queries (preferred if present).
        subjects: string or iterable of subject strings (used if queries omitted or combined).
        max_results: how many top books to return after merge+sort.
        min_ratings: minimum ratingsCount to include a book in the ranking.
        per_request: how many items to request per page (1..40).
        pages: how many pages to fetch per target (1..10 recommended).

    Returns:
        List of normalized book dicts (same shape as _normalize_google_volume output).
    """
    try:
        def _to_iter(x):
            if x is None:
                return []
            if isinstance(x, str):
                return [x]
            try:
                iter(x)
            except TypeError:
                return [x]
            return list(x)

        query_list = _to_iter(queries)
        subject_list = _to_iter(subjects)

        
        targets = []
        if query_list:
            targets.extend(("q", q) for q in query_list)
        if subject_list:
            targets.extend(("subject", s) for s in subject_list)
        if not targets:
            targets = [("q", "")] 

        per_request = max(1, min(40, int(per_request)))
        pages = max(1, int(pages))

        seen = {}
        for t_type, t_val in targets:
            for p in range(pages):
                params = {
                    "printType": "books",
                    "maxResults": per_request,
                    "startIndex": p * per_request,
                }
                if t_type == "subject":
                    params["q"] = f"subject:{t_val}"
                else:
                    params["q"] = t_val or ""
                if API_KEY:
                    params["key"] = API_KEY

                try:
                    resp = requests.get(BASE_URL, params=params)
                    resp.raise_for_status()
                except Exception as e:
                    print(f"Warning: request failed for target={t_type}:{t_val} page={p}: {e}")
                    continue

                data = resp.json() or {}
                items = data.get("items") or []
                for vol in items:
                    isbn = _extract_isbn_from_volume(vol)
                    norm = _normalize_google_volume(isbn, vol)
                    avg = norm.get("averageRating")
                    ratings_count = norm.get("ratingsCount") or 0
                    if avg is None:
                        continue
                    if ratings_count < min_ratings:
                        continue

                    
                    key = isbn or (norm.get("title") or "") + "|" + ",".join(norm.get("authors") or [])

                    existing = seen.get(key)
                    if not existing:
                        seen[key] = norm
                    else:
                        
                        if (norm.get("averageRating") or 0, norm.get("ratingsCount") or 0) > (
                            existing.get("averageRating") or 0,
                            existing.get("ratingsCount") or 0,
                        ):
                            seen[key] = norm

        normalized = list(seen.values())
        normalized.sort(key=lambda b: ((b.get("averageRating") or 0), (b.get("ratingsCount") or 0)), reverse=True)

        return normalized[:max_results]

    except Exception as e:
        print(f"Error fetching top rated books: {str(e)}")
        return []
