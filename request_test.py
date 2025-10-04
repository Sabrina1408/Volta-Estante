import requests

BASE_URL = "http://localhost:5000"

def test_add_book(isbn: str):
    url = f"{BASE_URL}/books"
    payload = {"isbn": isbn}
    response = requests.post(url, json=payload)  # requests sets Content-Type for us
    print("POST /books")
    print("Status:", response.status_code)
    print("Response:", response.json())
    print("-" * 50)

def test_get_book(isbn: str):
    url = f"{BASE_URL}/books"
    params = {"isbn": isbn}
    response = requests.get(url, params=params)
    print("GET /books")
    print("Status:", response.status_code)
    print("Response:", response.json())
    print("-" * 50)

def test_delete_book(isbn: str):
    url = f"{BASE_URL}/books"
    params = {"isbn": isbn}
    response = requests.delete(url, params=params)
    print("DELETE /books")
    print("Status:", response.status_code)
    print("Response:", response.json())
    print("-" * 50)

def test_update_book(isbn: str, update_data: dict):
    url = f"{BASE_URL}/books"
    params = {"isbn": isbn}
    response = requests.put(url, params=params, json=update_data)
    print("PUT /books")
    print("Status:", response.status_code)
    print("Response:", response.json())
    print("-" * 50)


if __name__ == "__main__":
    isbn = "9780140449136"  # Example ISBN

    # Test add (fetches from Google API if not in Firestore)
    test_add_book(isbn)

    # Test get
    test_get_book(isbn)

    # Test update
    test_update_book(isbn, {"title": "Updated Title via Test Script"})

    # Test delete
    test_delete_book(isbn)

    # Try fetching after delete
    test_get_book(isbn)
