import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:5000"
ISBN = "9780140449136"

copy_id_to_update = None  # Will be set after adding a copy


def print_section(title):
    print("\n" + "=" * 60)
    print(f"📘 {title}")
    print("=" * 60)


def print_request_info(method, url, payload=None):
    print(f"\n➡ {method} {url}")
    if payload:
        print(f"Payload: {json.dumps(payload)}")


# -------------------------------
#  POST /books — Add first copy
# -------------------------------
def test_add_book():
    global copy_id_to_update
    url = f"{BASE_URL}/books"
    payload = {
        "isbn": ISBN,
        "price": 39.90,
        "conservation_state": "Ótimo estado"
    }
    print_request_info("POST", url, payload)
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    print("Status:", response.status_code)
    try:
        data = response.json()
        # pprint(data)

        # Grab the first copy_id to use in update test
        copies = data.get("copies", {})
        if copies:
            copy_id_to_update = list(copies.keys())[0]

    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  POST /books — Add second copy
# -------------------------------
def test_add_book2():
    url = f"{BASE_URL}/books"
    payload = {
        "isbn": ISBN,
        "price": 29.90,
        "conservation_state": "Mediano"
    }
    print_request_info("POST", url, payload)
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    print("Status:", response.status_code)
    


# -------------------------------
#  GET /books/<isbn>
# -------------------------------
def test_get_book():
    url = f"{BASE_URL}/books/{ISBN}"
    print_request_info("GET", url)
    response = requests.get(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  PUT /books/<isbn>/copies/<copy_id>
# -------------------------------
def test_update_book():
    if not copy_id_to_update:
        print("\n⚠ No copy_id available to update.")
        return

    url = f"{BASE_URL}/books/{ISBN}/copies/{copy_id_to_update}"
    payload = {
        "price": 49.90,
        "conservation_state": "Excelente estado"
    }
    print_request_info("PUT", url, payload)
    response = requests.put(
        url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  DELETE /books/<isbn>
# -------------------------------
def test_delete_book():
    url = f"{BASE_URL}/books/{ISBN}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  Run All Tests
# -------------------------------
if __name__ == "__main__":
    test_delete_book()
    test_add_book()
    test_add_book2()
    test_get_book()
    test_update_book()
    test_get_book()
    
    # test_delete_book() # deve deletar TODA entidade do DB, não só as copias
    
