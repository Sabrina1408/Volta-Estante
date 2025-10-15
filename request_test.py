import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:5000"
ISBN = "9780140449136"

# ==============================================================================
# IMPORTANT: You must replace this with a valid Firebase ID token for the tests.
# You can get this from your client application after a user signs in.
# ==============================================================================
AUTH_TOKEN = "PASTE_YOUR_FIREBASE_ID_TOKEN_HERE"
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {AUTH_TOKEN}"}
copyID = None  # Will be set after adding a copy

def print_section(title):
    print("\n" + "=" * 60)
    print(f"📘 {title}")
    print("=" * 60)


def print_request_info(method, url, payload=None):
    print(f"\n➡ {method} {url}")
    if payload:
        print(f"Payload: {json.dumps(payload)}")

def test_add_user():
    url = f"{BASE_URL}/users"
    # The user's ID, email, and name are now taken from the auth token.
    # We only need to provide application-specific data.
    payload = {
        "nameSebo" : "Testing Pydantic"
    }
    print_request_info("POST", url, payload)
    response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
    print("Status:", response.status_code)
    try:
        data = response.json()
        pprint(data)
        if response.status_code == 201 and data.get("seboId"):
            print("✅ User and Sebo created successfully.")
    except Exception:
        print("Response Text:", response.text)

def test_delete_user():
    # Note: This requires the user in the token to have an ADMIN role.
    # The user ID to delete would typically come from another source,
    # but for this test, we'll assume we want to delete a different user.
    user_to_delete_id = "some-other-user-id"
    url = f"{BASE_URL}/users/{user_to_delete_id}"
    print_request_info("DELETE", url)
    response = requests.delete(url, headers=HEADERS)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_add_book_copy():
    global copyID
    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books"
    payload = {
        "ISBN": ISBN,
        "price": 39.90,
        "conservationState": "Ótimo estado"
    }
    print_request_info("POST", url, payload)
    response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
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

def test_add_second_book_copy():
    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books"
    payload = {
        "ISBN": ISBN,
        "price": 29.90,
        "conservationState": "Mediano"
    }
    print_request_info("POST", url, payload)
    response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
    print("Status:", response.status_code)
    try:
        data = response.json()
        pprint(data)
        if response.status_code == 201:
            print("✅ Second book copy added.")
    except Exception:
        print("Response Text:", response.text)

def test_get_book_and_capture_copy_id():
    global copyID
    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books/{ISBN}"
    print_request_info("GET", url)
    response = requests.get(url, headers=HEADERS)
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

def test_update_book_copy():
    if not copyID:
        print("\n⚠ No copyID available to update. Run 'get book' test first.")
        return

    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books/{ISBN}/copies/{copyID}"
    payload = {
        "price": 49.90,
        "conservationState": "Excelente estado"
    }
    print_request_info("PUT", url, payload)
    response = requests.put(url, headers=HEADERS, data=json.dumps(payload))
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_delete_book():
    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books/{ISBN}"
    print_request_info("DELETE", url)
    response = requests.delete(url, headers=HEADERS)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_delete_copy():
    if not copyID:
        print("\n⚠ No copyID available to delete. Run 'get book' test first.")
        return

    # The seboID is now inferred from the user's token on the backend.
    url = f"{BASE_URL}/books/{ISBN}/copies/{copyID}"
    print_request_info("DELETE", url)
    response = requests.delete(url, headers=HEADERS)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_create_sale():
    if not copyID:
        print("\n⚠ No copyID available to create a sale. Run 'get book' test first.")
        return
    url = f"{BASE_URL}/sales/{ISBN}/{copyID}"

    print_request_info("POST", url)
    response = requests.post(url, headers=HEADERS)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


if __name__ == "__main__":
    if "PASTE_YOUR_FIREBASE_ID_TOKEN_HERE" in AUTH_TOKEN:
        print("🛑 Please replace 'PASTE_YOUR_FIREBASE_ID_TOKEN_HERE' in the script with a real token.")
        exit(1)

    print_section("Initial Cleanup")
    test_delete_book()

    print_section("Step 1: Create User Profile (if it doesn't exist)")
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