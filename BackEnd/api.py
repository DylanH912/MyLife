from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # FIXED: Added for JSON body support
from accounts import register, login
import httpx
import io
import os
from dotenv import load_dotenv, dotenv_values 
load_dotenv()

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


@app.post("/food")
async def analyze_food_image(file: UploadFile = File(...)): # FIXED: Now accepts a real file upload
    url = f"https://api.spoonacular.com{os.getenv("SPOON_API_KEY")}"
    
    # Read the file sent from the phone
    content = await file.read()
    files = {"image": (file.filename, content, file.content_type)}
    
    response = httpx.post(url, files=files)
    response.raise_for_status()
    print(response.json())
    return response.json()

@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...), mode: str = Form(...), extraflag = False): # FIXED: Now accepts a real file upload
    url = "https://api.tabscanner.com"
    headers = {"X-API-Key": os.getenv("TABSCANNER_API_KEY")}
    
    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}
    
    response = httpx.post(url, headers=headers, files=files)
    response.raise_for_status()
    return response.json()
