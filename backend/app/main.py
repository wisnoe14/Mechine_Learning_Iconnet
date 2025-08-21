from fastapi import FastAPI
<<<<<<< HEAD
from app.api.v1 import api_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="FastAPI ChatGPT Integration")

# Middleware CORSM
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
=======
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router

app = FastAPI(title="FastAPI Chatbot Integration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
>>>>>>> c650f2cd9391a9bcc07ef75178b2cc8d65633c1c
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1/endpoints")

@app.get("/")
def root():
<<<<<<< HEAD
    return {"message": "FastAPI ChatGPT API is running"}
=======
    return {"message": "FastAPI Chatbot API is running"}
>>>>>>> c650f2cd9391a9bcc07ef75178b2cc8d65633c1c
