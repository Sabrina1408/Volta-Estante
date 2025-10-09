import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:5000"
ISBN = "9780140449136"
sebo_id = "4f74e8f0-3ed1-4da4-8361-8bd27ce62bdc"
copy_id_to_update = "e6165860-f20f-4974-8757-6fa680dfdd3b"  # Will be set after adding a copy


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

def test_user_add():
    url = f"{BASE_URL}/users"
    payload = {
        "user_id": "tralelo tralala", # isso é gerado pelo firebase auth
        "email" : "sadasd@nsei.com2",
        "funcaoAdmin" : "Admin",
        "nomeSebo" : "bombadilo"
    }
    print_request_info("POST", url, payload)
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_add_book():
    global copy_id_to_update
    url = f"{BASE_URL}/books"
    payload = {
        "isbn": ISBN,
        "price": 39.90,
        "conservation_state": "Ótimo estado",
        "sebo_id": sebo_id
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
        # Assuming the response contains the copy_id of the newly created copy
        if 'copy' in data and 'copy_id' in data['copy']:
            copy_id_to_update = data['copy']['copy_id']
            print(f"✅ Captured copy_id: {copy_id_to_update}")
        else:
            print("⚠ Could not find 'copy_id' in the response.")

        
        

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
        "conservation_state": "Mediano",
        "sebo_id": sebo_id
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
    url = f"{BASE_URL}/books/{sebo_id}/{ISBN}"
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
    url = f"{BASE_URL}/books/{sebo_id}/{ISBN}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_delete_copy():
    url = f"{BASE_URL}/books/{sebo_id}/{ISBN}/copies/{copy_id_to_update}"
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
    test_delete_copy()
    test_get_book()
    
    
    
    
