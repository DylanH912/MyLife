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
async def analyze_food_image(file: UploadFile = File(...)): # FIXED: Now accepts a real file upload
    endpoint = f"https://api.spoonacular.com/food/images/classify?apiKey={os.getenv('SPOON_API_KEY')}"    
    content = await file.read()
    # Spoonacular expects the parameter name to be 'file'
    files = {"file": (file.filename, content, file.content_type)}
    
    try:
        response = requests.post(endpoint, files=files)
        print(response.text) # DEBUG: Print the raw response from Spoonacular
        response.raise_for_status()
        parsed_response = response.json()
        category = parsed_response.get("category", "Unknown")
        probability = parsed_response.get("probability", 0)
        if category == "Unknown" or probability < 0.5:
            print("Low confidence in category prediction, returning 'Unknown'")
            return False # DEBUG: Log low confidence cases
        else:
            return (get_nutritional_info(category))
    except Exception as e:
        # This will show you the real error from Spoonacular if it fails
        detail = response.text if 'response' in locals() else str(e)
        raise HTTPException(status_code=500, detail=detail)
    
def get_nutritional_info(food_name):
    print("In get_nutritional_info") # DEBUG: Log entry into the function
    endpoint = f"https://api.spoonacular.com/recipes/guessNutrition?title=${food_name}&apiKey={os.getenv('SPOON_API_KEY')}"
    response = requests.get(endpoint)
    print(response.text) # DEBUG: Print the raw response from Spoonacular for nutritional info
    response.raise_for_status()
    data = response.json()
    calories = data.get("calories", {}).get("value", 0)
    protein = data.get("protein", {}).get("value", 0)
    carbs = data.get("carbs", {}).get("value", 0)
    fat = data.get("fat", {}).get("value", 0)
    if calories > 0 or protein > 0: # Basic check to see if we got valid nutritional info
        print(f"Retrieved nutritional info for {food_name}: Calories={calories}, Protein={protein}, Fat={fat}, Carbs={carbs}") # DEBUG: Log retrieved nutritional info
        return post_nutritional_info(food_name, calories, protein, fat, carbs)
    else:
        print(f"No nutritional info found for {food_name}") # DEBUG: Log when no info is found
        return False # Default values if no match found
    
def post_nutritional_info(food_name, calories, protein, fat, carbs):
    print("In post_nutritional_info")
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO nutrition (food_name, calories, protein, fat, carbs) VALUES (%s, %s, %s, %s, %s)",
        (food_name, calories, protein, fat, carbs)
    )
    conn.commit()
    cursor.close()
    conn.close()
    print("Updated pantry with nutritional info") # DEBUG: Log database update
    return True    


@app.post("/receipt")
@app.post("/receipt")
async def analyze_receipt_image(file: UploadFile = File(...)): 
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
        save_pantry_item(item["name"], 1)  # Default quantity to 1 for simplicity
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

def save_pantry_item(food_name, quantity):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO pantry (food_name, quantity)
        VALUES (%s, %s)
        ON CONFLICT (food_name)
        DO UPDATE SET quantity = pantry.quantity + EXCLUDED.quantity
        """,
        (food_name, quantity)
    )

    conn.commit()
    cursor.close()
    conn.close()


@app.get("/pantry")
def get_pantry_items():
    print ("pantry endpoint hit") #Debug

    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()
    cursor.execute("SELECT food_name, quantity FROM pantry")
    items = cursor.fetchall()

    cursor.close()
    conn.close()

    return [{"food_name": item[0], "quantity": item[1]} for item in items]

@app.delete("/pantry/{food_name}/{amount}")
def delete_pantry_item(food_name: str, amount: int):
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
    new_quantity = current_quantity - amount
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