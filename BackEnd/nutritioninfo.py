from fastapi import UploadFile

from api import analyze_food_image, analyze_receipt_image
import database as db
import psycopg2
import json


async def get_food_info(file: UploadFile):
    try:
        api_result = await analyze_food_image(file)

        info = extract_nutrition_info(api_result)

        save_nutrition_info(
            info["food_name"],
            info["calories"],
            info["protein"],
            info["fat"],
            info["carbs"]
        )

        return info
    
    except Exception as e:
        print(f"Error analyzing food image: {e}")
        return {"error": str(e)}
    
def extract_nutrition_info(data):
    category = data.get("category", "Unknown")

    return {
        "food_name": category,
        "calories": data.get("calories", 0),
        "protein": data.get("protein", 0),
        "fat": data.get("fat", 0),
        "carbs": data.get("carbs", 0)
    }

def extract_receipt_items(data):
    items = []
    try:
        raw_items = data.get("document", {}).get("items", [])
        for item in raw_items:
            name = item.get("desc", "Unknown")
            quantity = item.get("qty", 1)
            try:
                quantity = int(quantity)
            except:
                quantity = 1

            items.append({
                "food_name": name,
                "quantity": quantity
            })
    except Exception as e:
        print("Error parsing receipt:", e)
    return items


def get_receipt_info(file_path: str):
    try:
        data = analyze_receipt_image(file_path)
        items = extract_receipt_items(data)
        for item in items:
            save_pantry_item(
                item["food_name"],
                item["quantity"]
            )
        return items

    except Exception as e:
        print(f"Error analyzing receipt image: {e}")
        return {"error": str(e)}
    
# Send nutrition info to database
def save_nutrition_info(food_name, calories, protein, fat, carbs):
    conn = psycopg2.connect(db.databaseURL)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO nutrition_info (food_name, calories, protein, fat, carbs)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (food_name, calories, protein, fat, carbs)
    )

    conn.commit()
    cursor.close()
    conn.close()

# Send pantry items to database
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