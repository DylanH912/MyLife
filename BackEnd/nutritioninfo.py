from api import analyze_food_image, analyze_receipt_image

def get_food_info(file_path: str):
    try:
        data = analyze_food_image(file_path)
        return data
    except Exception as e:
        print(f"Error analyzing food image: {e}")
        return {error, str(e)}

def get_receipt_info(file_path: str):
    try:
        data = analyze_receipt_image(file_path)
        return data
    except Exception as e:
        print(f"Error analyzing receipt image: {e}")
        return {error, str(e)}