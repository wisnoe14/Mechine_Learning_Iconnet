from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gpt_service import generate_question, save_conversation_to_excel, process_customer_answer

router = APIRouter()

class QuestionRequest(BaseModel):
    customer_id: str
    context: str = ""


from typing import Optional

class AnswerRequest(BaseModel):
    customer_id: str
    topic: str
    question: str
    selected_option: Optional[str] = None
    manual_input: Optional[str] = None

@router.post("/generate-question/{topic}")
def generate_question_endpoint(topic: str, req: QuestionRequest):
    if topic not in ["telecollection", "retention", "winback"]:
        raise HTTPException(status_code=400, detail="Invalid topic")
    question = generate_question(topic, req.context)
    save_conversation_to_excel(req.customer_id, topic, question, None, req.context)
    return {"question": question}


@router.post("/answer")
def answer_endpoint(req: AnswerRequest):
    answer = req.manual_input if req.manual_input else req.selected_option
    prediction = process_customer_answer(answer)
    save_conversation_to_excel(req.customer_id, req.topic, req.question, answer, prediction)
    return {"prediction": prediction}
