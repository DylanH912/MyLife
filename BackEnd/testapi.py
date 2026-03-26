from fastapi import testclient
from api import app

client = testclient.TestClient(app)

def test_analyze_receipt_image():
    with open("C:/MyLife/BackEnd/R.jpg", "rb") as f:
        response = client.post(
            "/receipt",
            files={"file": ("R.jpg", f, "image/jpeg")},
            data={"mode": "your_mode"} 
        )
    assert response.status_code == 200
    print(response.json())


test_analyze_receipt_image()