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
import json
import database as db
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = psycopg2.connect(db.databaseURL)
cursor = conn.cursor()

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
async def classify_food(
    file: UploadFile = File(...),
    mode: str = Form(...),
    userId: str = Form(...)
):
    spoon_api_key = os.getenv("SPOON_API_KEY")
    if not spoon_api_key:
        raise HTTPException(status_code=500, detail="Missing SPOON_API_KEY")

    endpoint = f"https://api.spoonacular.com/food/images/classify?apiKey={spoon_api_key}"

    try:
        content = await file.read()
        files = {"file": (file.filename, content, file.content_type)}

        spoon_response = requests.post(endpoint, files=files)
        print("=== SPOONACULAR RAW RESPONSE ===")
        print(spoon_response.text)
        print("=== END SPOONACULAR RESPONSE ===")

        spoon_response.raise_for_status()
        parsed = spoon_response.json()

        category = parsed.get("category", "Unknown")
        probability = parsed.get("probability", 0.0)

        if category == "Unknown" or probability < 0.8:
            return {
                "status": "uncertain",
                "message": "Low confidence in prediction.",
                "success": False
            }

        # All good: send back what the front‑end expects
        return {
            "status": "success",
            "message": f"Detected as '{category}'",
            "category": category,
            "probability": probability,
            "success": True
        }

    except Exception as e:
        detail = spoon_response.text if 'spoon_response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)


# ======================
# 2. NUTRITION HELPER: guess + save to DB
# ======================

def get_nutritional_info(food_name: str, user_id: int):
    spoon_api_key = os.getenv("SPOON_API_KEY")
    if not spoon_api_key:
        raise HTTPException(status_code=500, detail="Missing SPOON_API_KEY")

    endpoint = (
        f"https://api.spoonacular.com/recipes/guessNutrition"
        f"?title={food_name}&apiKey={spoon_api_key}"
    )

    response = requests.get(endpoint)
    print("=== SPOONACULAR NUTRITION RESPONSE ===")
    print(response.text)
    print("=== END NUTRITION RESPONSE ===")

    response.raise_for_status()
    data = response.json()

    calories = data.get("calories", {}).get("value", 0)
    protein = data.get("protein", {}).get("value", 0)
    carbs = data.get("carbs", {}).get("value", 0)
    fat = data.get("fat", {}).get("value", 0)

    if calories > 0 or protein > 0:
        return post_nutritional_info(food_name, calories, protein, fat, carbs, user_id)
    else:
        return False


def post_nutritional_info(
    food_name: str,
    calories: float,
    protein: float,
    fat: float,
    carbs: float,
    user_id: int
):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    # Insert into nutrition table
    cursor.execute(
        """
        INSERT INTO nutrition (food_name, calories, protein, fat, carbs, user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (food_name, calories, protein, fat, carbs, user_id)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return True


# ======================
# 3. UPLOAD ROUTE: receive user‑confirmed food name
# ======================

class FoodUploadRequest(BaseModel):
    file_url: str  # or extra fields if you pass info
    mode: str
    userId: str
    food_name: str

@app.post("/food/upload")
async def upload_food(
    request: FoodUploadRequest
):
    user_id_str = request.userId
    parsed_user_id: Optional[int] = None

    if user_id_str and user_id_str.strip().isdigit():
        parsed_user_id = int(user_id_str.strip())

    if not parsed_user_id:
        raise HTTPException(status_code=400, detail="Invalid or missing userId")

    # Use the user‑confirmed food name
    success = get_nutritional_info(request.food_name, parsed_user_id)

    if success:
        return {
            "success": True,
            "message": f"Nutritional info for '{request.food_name}' saved.",
            "food_name": request.food_name,
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve nutrition data for '{request.food_name}'"
        )


@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...),  mode: str = Form(...), userId: str = Form(...)): 
    userId = int(userId.strip()) if userId and userId.strip().isdigit() else None
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
    print(result.json()) # DEBUG: Print the raw response from Tabscanner
    food_items = simplify_receipt(result.json())
    print(f"Extracted food items: {food_items}") # DEBUG: Log extracted food items
    for item in food_items:
        save_pantry_item(item["name"], 1, userId)  # Default quantity to 1 for simplicity
    return food_items

def simplify_receipt(data):
    line_items = data.get("result", {}).get("lineItems", [])
    return [
        {
            "name": item.get("desc"),
        }
        for item in line_items
            if item.get("lineTotal", 0) > 0  # filter out $0 supplementary lines
    ]

def save_pantry_item(food_name, quantity, userId):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO pantry (food_name, quantity, user_id)
        VALUES (%s, %s, %s)
        ON CONFLICT (food_name)
        DO UPDATE SET quantity = pantry.quantity + EXCLUDED.quantity
        """,
        (food_name, quantity, userId)
    )

    conn.commit()
    cursor.close()
    conn.close()


@app.get("/pantry/{userId}")
def get_pantry_items(userId: int):
    print ("pantry endpoint hit") #Debug

    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    cursor.execute("SELECT food_name, quantity FROM pantry where user_id = %s", (userId,))
    items = cursor.fetchall()

    cursor.close()
    conn.close()

    return [{"food_name": item[0], "quantity": item[1]} for item in items]

@app.delete("/pantry/{food_name}")
def delete_pantry_item(food_name: str):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT quantity FROM pantry WHERE food_name = %s",
        (food_name,)
    )
    result = cursor.fetchone()
    if not result:
        cursor.close()
        conn.close()
        return {"error": "Item not found"}

    current_quantity = result[0]
    new_quantity = current_quantity - 1  # always subtract 1

    if new_quantity <= 0:
        cursor.execute(
            "DELETE FROM pantry WHERE food_name = %s",
            (food_name,)
        )
        message = f"{food_name} removed completely"
    else:
        cursor.execute(
            "UPDATE pantry SET quantity = %s WHERE food_name = %s",
            (new_quantity, food_name)
        )
        message = f"{food_name} quantity updated to {new_quantity}"

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": message}