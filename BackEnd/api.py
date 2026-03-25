import requests

# API keys: move to .env eventually
SPOONACULAR_API_KEY = "107f03cbca3c4968b0109fef8bc415be"
TABSCANNER_API_LEY = "J9OzeFLbOirXCP9LoVWKRK6XpOFXGOS8AMVBYsa6WwJLqTN848kBC454r81Od5cT"

def analyze_food_image(file_path: str):
    url = f"https://api.spoonacular.com/food/images/analyze?apiKey={SPOONACULAR_API_KEY}"
    with open(file_path, "rb") as image_file:
        files = {
            "image": ("photo.jpg", image_file, "image/jpeg")
        }
        response = requests.post(url, files=files)
    response.raise_for_status()
    return response.json()


def analyze_receipt_image(file_path: str):
    url = "https://api.tabscanner.com/api/2/process"
    headers = {
        "X-API-Key": TABSCANNER_API_KEY
    }
    with open(file_path, "rb") as image_file:
        files = {
            "file": ("photo.jpg", image_file, "image/jpeg")
        }
        response = requests.post(url, headers=headers, files=files)
    response.raise_for_status()
    return response.json()