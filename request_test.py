import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:5000"
ISBN = "9780140449136"
seboID = None  # Will be set after creating a user
copyID = None  # Will be set after adding a copy
userID = "firebase-auth-uid2"


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

def test_add_user():
    global seboID
    url = f"{BASE_URL}/users"
    payload = {
        "userId": userID, # isso é gerado pelo firebase auth
        "name" : "Mistério",
        "email": "Ocultando-userRole@email.com",
        "nameSebo" : "Testing Pydantic"
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
        pprint(data)
        if response.status_code == 201 and data.get("seboId"):
            seboID = data["seboId"]
            print(f"✅ User and Sebo created. Captured seboID: {seboID}")
    except Exception:
        print("Response Text:", response.text)

def test_delete_user():
    url = f"{BASE_URL}/users/{userID}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


def test_add_book_copy():
    global copyID
    if not seboID:
        print("\n⚠ No seboID available to add a book. Run 'add user' test first.")
        return

    url = f"{BASE_URL}/books/{seboID}"
    payload = {
        "ISBN": ISBN,
        "price": 39.90,
        "conservationState": "Ótimo estado"
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
        pprint(data)

        if response.status_code == 201 and data.get("copies"):
            # Capture the first copy ID for subsequent tests
            copyID = data["copies"][0]["copyId"]
            print("✅ First book copy added.")
            print(f"✅ Captured copyID: {copyID}")
    except Exception as e:
        print("Response Text:", response.text)


# -------------------------------
#  POST /books — Add second copy
# -------------------------------
def test_add_second_book_copy():
    if not seboID:
        print("\n⚠ No seboID available to add a book. Run 'add user' test first.")
        return

    url = f"{BASE_URL}/books/{seboID}"
    payload = {
        "ISBN": ISBN,
        "price": 29.90,
        "conservationState": "Mediano"
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
        pprint(data)
        if response.status_code == 201:
            print("✅ Second book copy added.")
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  GET /books/<ISBN>
# -------------------------------
def test_get_book_and_capture_copy_id():
    global copyID
    if not seboID:
        print("\n⚠ No seboID available to get a book. Run 'add user' test first.")
        return

    url = f"{BASE_URL}/books/{seboID}/{ISBN}"
    print_request_info("GET", url)
    response = requests.get(url)
    print("Status:", response.status_code)
    try:
        data = response.json()
        pprint(data)
        if data.get("copies") and len(data["copies"]) > 0:
            # Capture the last copy ID for subsequent tests
            copyID = data["copies"][-1]["copyId"]
            print(f"✅ Captured copyID: {copyID}")
        else:
            print("⚠ Could not find any copies for this book.")
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  PUT /books/<ISBN>/copies/<copyID>
# -------------------------------
def test_update_book_copy():
    if not seboID:
        print("\n⚠ No seboID available to update a book. Run 'add user' test first.")
        return
    if not copyID:
        print("\n⚠ No copyID available to update. Run 'get book' test first.")
        return

    url = f"{BASE_URL}/books/{seboID}/{ISBN}/copies/{copyID}"
    payload = {
        "price": 49.90,
        "conservationState": "Excelente estado"
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
#  DELETE /books/<ISBN>
# -------------------------------
def test_delete_book():
    if not seboID:
        print("\n⚠ No seboID available to delete a book. Skipping initial cleanup.")
        return

    url = f"{BASE_URL}/books/{seboID}/{ISBN}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_delete_copy():
    if not seboID:
        print("\n⚠ No seboID available to delete a copy. Run 'add user' test first.")
        return
    if not copyID:
        print("\n⚠ No copyID available to delete. Run 'get book' test first.")
        return

    url = f"{BASE_URL}/books/{seboID}/{ISBN}/copies/{copyID}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)
    
def test_create_sale():
    if not seboID:
        print("\n⚠ No seboID available to create a sale. Run 'add user' test first.")
        return
    if not copyID:
        print("\n⚠ No copyID available to create a sale. Run 'get book' test first.")
        return
    url = f"{BASE_URL}/sales/{userID}/{ISBN}/{copyID}"

    print_request_info("POST", url)
    response = requests.post(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)



# -------------------------------
#  Run All Tests
# -------------------------------
if __name__ == "__main__":
    print_section("Initial Cleanup")
    print("--- Deleting User (if it exists) ---")
    test_delete_user()
    # seboID is now None, so we must create a user to get a new one.
    # The old book is tied to the old sebo, so it's effectively gone.

    print_section("Step 1: Create User and Sebo")
    test_add_user()

    print_section("Step 2: Add First Copy of the Book")
    test_add_book_copy()

    print_section("Step 3: Add Second Copy of the Book")
    test_add_second_book_copy()

    print_section("Step 4: Get Book and Capture Last Copy ID")
    test_get_book_and_capture_copy_id()

    print_section("Step 5: Update the Last Copy")
    test_update_book_copy()

    print_section("Step 6: Create a Sale with the Updated Copy")
    test_create_sale()

    print_section("Step 7: Final Cleanup")
    print("--- Deleting Book (if it exists) ---")
    test_delete_book()