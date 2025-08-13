from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.api.v1 import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FastAPI ChatGPT Integration")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ganti dengan URL frontend Anda
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware CSP
class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        csp_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:8000;"
        response.headers['Content-Security-Policy'] = csp_policy
        return response

app.add_middleware(CSPMiddleware)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "FastAPI ChatGPT API is running"}
