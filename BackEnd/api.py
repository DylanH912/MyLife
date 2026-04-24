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
import re
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

FOOD_TERMS = {
    # basic food categories
    "edamame", "vegetable", "veggie", "fruit", "berry", "grape", "apple", "banana",
    "orange", "grapefruit", "cherry", "cherry", "grape", "kiwi", "pineapple",
    "mango", "avocado", "onion", "garlic", "potato", "tomato", "cucumber",
    "pepper", "bell pepper", "carrot", "celery", "lettuce", "spinach", "cabbage",
    "broccoli", "cauliflower", "peas", "beans", "lentils", "chickpeas",
    "hummus", "bean", "pea", "nut", "almond", "walnut", "pistachio", "pistachio",
    "cashew", "peanut", "butter", "jam", "jelly", "honey", "mustard", "ketchup",
    "sauce", "dressing", "soup", "stew", "chili", "salad", "wrap", "sandwich",
    "bread", "roll", "baguette", "bun", "hamburger bun", "hot dog bun",
    "pizza", "cracker", "chip", "snack", "cookie", "cake", "muffin", "pastry",
    "pie", "pretzel", "cracker", "popcorn", "popcorn", "cracker", "granola",
    "cereal", "oats", "oatmeal", "cereal", "oat", "cereal", "granola",
    "rice", "pasta", "noodle", "spaghetti", "lasagna", "ramen", "ramen",
    "tortilla", "wrap", "pita", "bread", "baguette", "biscuit", "muffin",
    "cake", "cupcake", "donut", "dessert", "pastry", "pie", "pudding", "gelatin",
    "yogurt", "yoghurt", "yogurt", "cheese", "cream cheese", "sour cream",
    "milk", "milkshake", "smoothie", "juice", "soda", "cola", "sprite",
    "beer", "wine", "champagne", "whiskey", "gin", "rum", "vodka",
    "coffee", "espresso", "latte", "cappuccino", "tea", "chai", "matcha",
    "egg", "chicken", "turkey", "beef", "steak", "pork", "bacon", "ham",
    "sausage", "hot dog", "pepperoni", "salami", "fish", "salmon", "tuna",
    "shrimp", "crab", "lobster", "scallop", "oyster", "clam", "mussel",
    "taco", "burrito", "wrap", "sandwich", "burger", "hot dog", "pizza",
    "sushi", "sashimi", "ramen", "stir fry", "curry", "noodle", "rice",
    "bread", "biscuit", "cracker", "cookie", "bar", "grain", "corn", "maize",
    "squash", "pumpkin", "zucchini", "eggplant", "okra", "cabbage", "cucumber",
    "bell", "pepper", "jalapeno", "chili", "pepper", "onion", "shallot",
    "garlic", "ginger", "herb", "spice", "oregano", "basil", "thyme",
    "rosemary", "mint", "cilantro", "coriander", "parsley", "dill", "sage",
    "salt", "pepper", "sugar", "honey", "syrup", "maple", "butter", "oil",
    "olive oil", "canola", "avocado oil", "coconut oil",

    # common brand‑style descriptors
    "organic", "organic", "natural", "low fat", "lowfat", "fat free", "gluten free",
    "glutenfree", "vegan", "plant based", "dairy free", "lactose free", "lactosefree",
    "sugar free", "sugarfree", "unsweetened", "unsweetened", "caffeine free",
    "frozen", "frozen", "fresh", "fresh", "precooked", "ready to eat", "instant",
    "microwave", "snack", "meal", "lunch", "breakfast", "brunch", "dinner",
}

NON_FOOD_TERMS = {
    # store / receipt fluff
    "tax", "sale tax", "taxation", "gst", "hst",
    "fee", "bag fee", "bag", "plastic", "paper", "carryout", "deposit",
    "card", "debit", "credit", "register", "cashier", "subtotal", "total",
    "change", "tip", "tip", "gift card", "gc", "rewards", "discount",
    "coupon", "coupon", "reward", "loyalty", "points", "payment",
    "credit", "debit", "ebt", "wic", "food stamps", "foodstamps",
    "ib", "cv", "authorization", "void", "return", "refund", "exchange",
    "shipping", "delivery", "online", "app", "service", "charge", "service charge",
    "bag", "bags", "container", "bag fee", "environmental", "eco", "tax",
    "associate", "shift", "manager", "department", "store", "location",
    "invoice", "invoice number", "receipt", "order", "id", "barcode",
    "code", "item", "sku", "upc", "serial", "number",
    "register", "checkout", "scanner", "cashier", "pos",
    "card", "credit card", "debit card", "apple pay", "google pay",
}

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
async def analyze_receipt_image(
    file: UploadFile = File(...),
    userId: str = Form(None)   # ← taken from multipart form, not request body
):
    print(f"Received userId: {userId}")

    url = "https://api.tabscanner.com/api/2/process/"
    result_url = "https://api.tabscanner.com/api/result/{0}"
    headers = {"apikey": os.getenv("TABSCANNER_API_KEY")}
    payload = {"documentType": "receipt"}

    content = await file.read()
    files = {"file": (file.filename, content, file.content_type)}

    response = requests.post(url, files=files, data=payload, headers=headers)
    token = response.json().get("token")

    endpoint = result_url.format(token)
    time.sleep(5)
    result = requests.get(endpoint, headers=headers)
    result.raise_for_status()
    print(result.json())

    food_items = simplify_receipt(result.json())
    print(f"Extracted food items: {food_items}")

    for item in food_items:
        print(f"Checking if '{item['name']}' is food...")
        if check_is_food(item["name"]):
            save_pantry_item(
                item["name"], 1, user_id=userId
            )

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

def normalize_receipt_line(line: str) -> str:
    # Remove barcodes, quantities, units, prices, F/I/KI/KF
    text = re.sub(r"[0-9.]+(\s*(lb|@|\$|pc|oz|kg|g|ml|l|gal|qt|pt|ea|each))?", " ", line)
    text = re.sub(r"[^a-zA-Z ]+", " ", text)  # keep only letters and spaces
    text = " ".join(text.split()).lower()
    return text

def likely_food_cheap_heuristic(text: str) -> bool | None:
    """
    Returns:
        True  -> clearly food
        False -> clearly non‑food
        None  -> ambiguous; fall back to Spoonacular
    """
    clean = normalize_receipt_line(text)
    words = {w for w in clean.split() if len(w) > 1}

    if words & FOOD_TERMS:
        return True       # e.g., "edamame", "cucumber"
    if words & NON_FOOD_TERMS:
        return False      # e.g., "tax", "bag fee"
    return None           # don’t know; check with API


def check_is_food(food_name: str) -> bool:
    # 1. Fast rule: English‑based food vs non‑food
    heuristic = likely_food_cheap_heuristic(food_name)
    if heuristic is True:
        return True
    if heuristic is False:
        return False

    # 2. If uncertain, fall back to Spoonacular
    url = "https://api.spoonacular.com/food/ingredients/search"
    params = {
        "query": food_name,
        "number": 1,
        "apiKey": os.getenv("SPOON_API_KEY"),
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        return data.get("totalResults", 0) > 0
    except Exception as e:
        # If Spoonacular fails, default conservatively
        print(f"Spoonacular error: {e}")
        return False

def save_pantry_item(food_name: str, quantity: int, user_id: str | None):
    # assuming you have a user_id column in pantry
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO pantry (food_name, quantity, user_id)
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id, food_name)
        DO UPDATE SET quantity = pantry.quantity + EXCLUDED.quantity
        """,
        (food_name, quantity, user_id)
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