import re
def sanitize_isbn(isbn: str) -> str:
    if not isbn:
        return ""
    return re.sub(r"[^0-9Xx]", "", str(isbn)).upper()


