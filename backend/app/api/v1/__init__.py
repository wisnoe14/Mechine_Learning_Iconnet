from fastapi import APIRouter
from app.api.v1.endpoints import chat, conversation

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chatgpt", tags=["ChatGPT"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
