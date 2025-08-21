from fastapi import APIRouter
from .endpoints import chat, conversation, login, check, predict

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chatgpt", tags=["ChatGPT"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
api_router.include_router(login.router, prefix="/auth", tags=["Auth"])
api_router.include_router(check.router, prefix="/customer", tags=["Check"])
api_router.include_router(predict.router, prefix="/predict", tags=["Predict"])
