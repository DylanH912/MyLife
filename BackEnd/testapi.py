from fastapi import testclient
from api import app
import PIL.Image as Image
import json

img = Image.open("C:/MyLife/BackEnd/R.jpg")
img.resize((720, 1280)).save("C:/MyLife/BackEnd/R.jpg") # Resize to 224x224 for testing
client = testclient.TestClient(app)

def test_analyze_receipt_image():
    with open("C:/MyLife/BackEnd/R.jpg", "rb") as f:
        response = client.post(
            "/receipt",
            files={"file": ("R.jpg", f, "image/jpeg")},
            data={"mode": "your_mode"} 
        )
    assert response.status_code == 200

def test_analyze_food_image():
    with open("C:/MyLife/BackEnd/food.png", "rb") as f:
        response = client.post(
            "/food",
            files={"file": ("food.png", f, "image/jpeg")}
        )
    #assert response.status_code == 200
    #print(response.json())

test_analyze_food_image()
    