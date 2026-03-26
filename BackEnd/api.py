from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # FIXED: Added for JSON body support
from accounts import register, login
import requests
import io

app = FastAPI()

# FIXED: Standard CORS setup to allow your Expo app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIXED: Added Pydantic model so FastAPI knows to look in the JSON Body
# Without this, FastAPI expects these as URL parameters (?email=...)
class UserAuth(BaseModel):
    email: str
    password: str

@app.post("/register")
def register_user(user: UserAuth): # FIXED: Uses the UserAuth model
    return register(user.email, user.password)

@app.post("/login")
def login_user(user: UserAuth): # FIXED: Uses the UserAuth model
    return login(user.email, user.password)

SPOONACULAR_API_KEY = "107f03cbca3c4968b0109fef8bc415be"
TABSCANNER_API_KEY = "J9OzeFLbOirXCP9LoVWKRK6XpOFXGOS8AMVBYsa6WwJLqTN848kBC454r81Od5cT"

@app.post("/food")
async def analyze_food_image(file: UploadFile = File(...)): # FIXED: Now accepts a real file upload
    url = f"https://api.spoonacular.com{SPOONACULAR_API_KEY}"
    
    # Read the file sent from the phone
    content = await file.read()
    files = {"image": (file.filename, content, file.content_type)}
    
    response = requests.post(url, files=files)
    response.raise_for_status()
    return response.json()

@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...)): # FIXED: Now accepts a real file upload
    url = "https://api.tabscanner.com"
    headers = {"X-API-Key": TABSCANNER_API_KEY}
    
    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}
    
    response = requests.post(url, headers=headers, files=files)
    response.raise_for_status()
    return response.json()
