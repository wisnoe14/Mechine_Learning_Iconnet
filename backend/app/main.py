from fastapi import FastAPI
from app.api.v1 import api_router

app = FastAPI(title="FastAPI ChatGPT Integration")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "FastAPI ChatGPT API is running"}
