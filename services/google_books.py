import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
BASE_URL = "https://www.googleapis.com/books/v1/volumes"

def fetch_book_by_isbn(isbn):
    params = {
        'q': f'isbn:{isbn}',
        'key': API_KEY
    }
    response = requests.get(BASE_URL, params=params)
    