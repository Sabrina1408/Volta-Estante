import re
from typing import Optional


def sanitize_isbn(isbn: str) -> str:
    if not isbn:
        return ""
    return re.sub(r"[^0-9Xx]", "", str(isbn)).upper()


def to_isbn13(isbn: str) -> str:
    
    s = sanitize_isbn(isbn)
    if len(s) == 13:
        return s
    if len(s) != 10:
        return s
    core9 = s[:9]
    if not core9.isdigit():
        return s
    base = "978" + core9
    total = 0
    for i, ch in enumerate(base):
        weight = 1 if i % 2 == 0 else 3
        total += int(ch) * weight
    check = (10 - (total % 10)) % 10
    return base + str(check)


def to_isbn10(isbn: str) -> Optional[str]:
    
    s = sanitize_isbn(isbn)
    if len(s) != 13 or not s.startswith("978"):
        return None
    core9 = s[3:12]
    if not core9.isdigit():
        return None
    total = 0
    for idx, ch in enumerate(core9):
        total += int(ch) * (10 - idx)
    rem = total % 11
    chk = (11 - rem) % 11
    return core9 + ("X" if chk == 10 else str(chk))
