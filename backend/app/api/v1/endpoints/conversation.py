from fastapi import APIRouter
from pydantic import BaseModel
from app.core.chatbot_engine import ChatbotEngine

router = APIRouter()

# Init chatbot engine sekali saja
chatbot = ChatbotEngine()

class UserAnswer(BaseModel):
    jawaban: str

@router.post("/next-question")
def get_next_question(user: UserAnswer):
    pertanyaan = chatbot.get_next_question(user.jawaban)
    return {"pertanyaan_selanjutnya": pertanyaan}
