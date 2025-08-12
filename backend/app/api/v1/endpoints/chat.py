from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gpt_service import generate_chatgpt_response

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str

@router.post("/chat")
def chat_with_gpt(data: ChatRequest):
    """Endpoint untuk mengirim prompt ke ChatGPT"""
    result = generate_chatgpt_response(data.prompt)
    return {"response": result}
