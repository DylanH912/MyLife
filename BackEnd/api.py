<<<<<<< HEAD
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from accounts import register, login

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register_user(email: str, password: str):
    return register(email, password)

@app.post("/login")
def login_user(email: str, password: str):
    return login(email, password)

=======
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
>>>>>>> bd7a4cf882645893ad586d577f65fe1ad0d10fe6
