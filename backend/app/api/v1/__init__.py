from fastapi import APIRouter
from app.api.v1.endpoints import chat, conversation, login, check, openai_intent

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chatgpt", tags=["ChatGPT"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
api_router.include_router(login.router, prefix="/auth", tags=["Auth"])
api_router.include_router(check.router, prefix="/customer", tags=["Check"])
api_router.include_router(openai_intent.router, prefix="/openai", tags=["OpenAI Intent"])
