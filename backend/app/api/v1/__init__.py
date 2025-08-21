from fastapi import APIRouter
<<<<<<< HEAD
from app.api.v1.endpoints import chat, conversation, login, check, openai_intent

api_router = APIRouter()
=======
from .endpoints import chat, conversation, login, check, predict

api_router = APIRouter()

>>>>>>> c650f2cd9391a9bcc07ef75178b2cc8d65633c1c
api_router.include_router(chat.router, prefix="/chatgpt", tags=["ChatGPT"])
api_router.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
api_router.include_router(login.router, prefix="/auth", tags=["Auth"])
api_router.include_router(check.router, prefix="/customer", tags=["Check"])
<<<<<<< HEAD
api_router.include_router(openai_intent.router, prefix="/openai", tags=["OpenAI Intent"])
=======
api_router.include_router(predict.router, prefix="/predict", tags=["Predict"])
>>>>>>> c650f2cd9391a9bcc07ef75178b2cc8d65633c1c
