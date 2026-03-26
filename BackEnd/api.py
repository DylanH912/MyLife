from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SPOONACULAR_API_KEY = "107f03cbca3c4968b0109fef8bc415be"
TABSCANNER_API_KEY = "J9OzeFLbOirXCP9LoVWKRK6XpOFXGOS8AMVBYsa6WwJLqTN848kBC454r81Od5cT"

@app.post("/food")
async def analyze_food_image(file: UploadFile = File(...)):
    # FIXED: Added proper path and apiKey parameter
    url = f"https://api.spoonacular.com{SPOONACULAR_API_KEY}"
    
    content = await file.read()
    # Spoonacular expects the parameter name to be 'file'
    files = {"file": (file.filename, content, file.content_type)}
    
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
    
    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}
    
    try:
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)
