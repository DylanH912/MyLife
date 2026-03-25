from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from accounts import register, login

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register_user(email: str, password: str):
    return register(email, password)

@app.post("/login")
def login_user(email: str, password: str):
    return login(email, password)

