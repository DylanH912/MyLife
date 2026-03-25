import requests

def analyze_food_image(file_path: str):
    with open(file_path, 'rb') as f:
        files = {"image": ("photo.jpg", f, "image/jpeg")}
        url = f"https://api.spoonacular.com/food/images/analyze?apiKey={SPOONACULAR_API_KEY}"
        response = requests.post(url, files=files)
    response.raise_for_status()
    return response.json()

def analyze_receipt_image(file_path: str):
    with open(file_path, 'rb') as f:
        files = {"file": ("receipt.jpg", f, "image/jpeg")}
        url = f"https://api.tabscanner.com/api/2/process:"
        response = requests.post(url, headers = headers, files=files)
    response.raise_for_status()
    return response.json()
