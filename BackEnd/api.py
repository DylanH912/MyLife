<<<<<<< HEAD
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
=======
from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # FIXED: Added for JSON body support
from accounts import register, login
import httpx
import io
import os
from dotenv import load_dotenv, dotenv_values 
load_dotenv()
>>>>>>> ed5869d353cdc452e4cc4b68615cff52b00e4333

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
SPOONACULAR_API_KEY = "107f03cbca3c4968b0109fef8bc415be"
TABSCANNER_API_KEY = "J9OzeFLbOirXCP9LoVWKRK6XpOFXGOS8AMVBYsa6WwJLqTN848kBC454r81Od5cT"

@app.post("/food")
async def analyze_food_image(file: UploadFile = File(...)):
    # FIXED: Added proper path and apiKey parameter
    url = f"https://api.spoonacular.com{SPOONACULAR_API_KEY}"
=======
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


@app.post("/food")
async def analyze_food_image(file: UploadFile = File(...)): # FIXED: Now accepts a real file upload
    url = f"https://api.spoonacular.com{os.getenv("SPOON_API_KEY")}"
>>>>>>> ed5869d353cdc452e4cc4b68615cff52b00e4333
    
    content = await file.read()
    # Spoonacular expects the parameter name to be 'file'
    files = {"file": (file.filename, content, file.content_type)}
    
<<<<<<< HEAD
    try:
        response = requests.post(url, files=files)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # This will show you the real error from Spoonacular if it fails
        detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)

@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...)):
    # FIXED: Added proper endpoint path
    url = "https://api.tabscanner.com"
    # Tabscanner uses 'apikey' header (lowercase)
    headers = {"apikey": TABSCANNER_API_KEY}
=======
    response = httpx.post(url, files=files)
    response.raise_for_status()
    print(response.json())
    return response.json()

@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...), mode: str = Form(...), extraflag = False): # FIXED: Now accepts a real file upload
    url = "https://api.tabscanner.com"
    headers = {"X-API-Key": os.getenv("TABSCANNER_API_KEY")}
>>>>>>> ed5869d353cdc452e4cc4b68615cff52b00e4333
    
    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}
    
<<<<<<< HEAD
    try:
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)
=======
    response = httpx.post(url, headers=headers, files=files)
    response.raise_for_status()
    return response.json()
>>>>>>> ed5869d353cdc452e4cc4b68615cff52b00e4333
