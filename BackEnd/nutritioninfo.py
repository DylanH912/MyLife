from api import analyze_food_image, analyze_receipt_image
import database as db
import psycopg2


def get_food_info(file_path: str):
    try:
        return analyze_food_image(file_path)
    except Exception as e:
        print(f"Error analyzing food image: {e}")
        return {"error": str(e)}


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

# Send to database
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