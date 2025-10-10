import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:5000"
ISBN = "9780140449136"
seboID = "294de8d9-4b9c-4caa-b3ed-c266bb877c98"
copyID = "668cf3c9-8a8c-469a-9995-3acc2220d67b"  # Will be set after adding a copy
userID = "tralelo tralala"

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
        "userID": "tralelo tralala", # isso é gerado pelo firebase auth
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
    global copyID_to_update
    url = f"{BASE_URL}/books/{seboID}"
    payload = {
        "ISBN": ISBN,
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
        pprint(data)
        # Assuming the response contains the copyID of the newly created copy
        if 'copy' in data and 'copyID' in data['copy']:
            copyID_to_update = data['copy']['copyID']
            print(f"✅ Captured copyID: {copyID_to_update}")
        else:
            print("⚠ Could not find 'copyID' in the response.")

        
        

    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  POST /books — Add second copy
# -------------------------------
def test_add_book2():
    url = f"{BASE_URL}/books/{seboID}"
    payload = {
        "ISBN": ISBN,
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
#  GET /books/<ISBN>
# -------------------------------
def test_get_book():
    url = f"{BASE_URL}/books/{seboID}/{ISBN}"
    print_request_info("GET", url)
    response = requests.get(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)


# -------------------------------
#  PUT /books/<ISBN>/copies/<copyID>
# -------------------------------
def test_update_book():
    if not copyID_to_update:
        print("\n⚠ No copyID available to update.")
        return

    url = f"{BASE_URL}/books/{seboID}/{ISBN}/copies/{copyID_to_update}"
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
#  DELETE /books/<ISBN>
# -------------------------------
def test_delete_book():
    url = f"{BASE_URL}/books/{seboID}/{ISBN}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)

def test_delete_copy():
    url = f"{BASE_URL}/books/{seboID}/{ISBN}/copies/{copyID_to_update}"
    print_request_info("DELETE", url)
    response = requests.delete(url)
    print("Status:", response.status_code)
    try:
        pprint(response.json())
    except Exception:
        print("Response Text:", response.text)
    
def test_sales_creation():
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
    test_sales_creation()
    
    
    
    
    
    
