from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # FIXED: Added for JSON body support
from accounts import register, login
import time
import os
from dotenv import load_dotenv, dotenv_values 
import psycopg2
import database as db
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



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
    endpoint = f"https://api.spoonacular.com/food/images/classify?apiKey={os.getenv('SPOON_API_KEY')}"    
    content = await file.read()
    # Spoonacular expects the parameter name to be 'file'
    files = {"file": (file.filename, content, file.content_type)}
    
    try:
        response = requests.post(endpoint, files=files)
        print(response.text) # DEBUG: Print the raw response from Spoonacular
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # This will show you the real error from Spoonacular if it fails
        detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)


@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...), mode: str = Form(...), extraflag = False): # FIXED: Now accepts a real file upload
    url = "https://api.tabscanner.com/api/2/process/"  # FIXED: Tabscanner API endpoint
    result_url = "https://api.tabscanner.com/api/result/{0}"
    print(os.getenv("TABSCANNER_API_KEY"))
    headers = {"apikey": os.getenv("TABSCANNER_API_KEY")}
    payload = {"documentType":"receipt"}    
    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}
    
    response = requests.post( url,
    files=files,
    data=payload,
    headers=headers)
    token = response.json().get("token")
    endpoint = result_url.format(token)
    time.sleep(5)  # FIXED: Wait for processing
    result = requests.get(endpoint, headers=headers)
    result.raise_for_status()
    print(result.text) # DEBUG: Print the raw response from Tabscanner
    return result.text

@app.get("/pantry")
def get_pantry_items():
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    
    cursor.execute("SELECT food_name, quantity FROM pantry")
    items = cursor.fetchall()

    cursor.close()
    conn.close()

    return [{"food_name": item[0], "quantity": item[1]} for item in items]
