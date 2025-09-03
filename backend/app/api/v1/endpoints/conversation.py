# --- ENDPOINTS ---

# --- IMPORTS & ROUTER ---
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Union, List, Dict
import numpy as np
from app.services.gpt_service import generate_question, save_conversation_to_excel, process_customer_answer
router = APIRouter()

# --- ENDPOINT: STATUS DIHUBUNGI OPTIONS ---
@router.get("/status-dihubungi-options")
def get_status_dihubungi_options():
    # Opsi default, bisa diambil dari model atau hardcode
    options = ["Bisa Dihubungi", "Tidak Dapat Dihubungi"]
    question = "Status dihubungi?"
    return {"question": question, "options": options}

# --- REQUEST MODELS ---
class NextQuestionRequest(BaseModel):
    customer_id: str
    topic: str
    conversation: list

class FinalPredictRequest(BaseModel):
    customer_id: str
    topic: str
    conversation: list

class QuestionRequest(BaseModel):
    customer_id: str
    context: Union[str, List[Dict[str, str]]] = ""

class AnswerRequest(BaseModel):
    customer_id: str
    topic: str
    question: str
    selected_option: Optional[str] = None
    manual_input: Optional[str] = None

class NextQuestionRequest(BaseModel):
    customer_id: str
    topic: str
    conversation: list


# --- ENDPOINTS ---
@router.post("/generate-question/{topic}")
def generate_question_endpoint(topic: str, req: QuestionRequest):
    if topic not in ["telecollection", "retention", "winback"]:
        raise HTTPException(status_code=400, detail="Invalid topic")
    context = req.context
    # Jika context kosong, kembalikan pertanyaan status dihubungi secara hardcode
    if not context or (isinstance(context, list) and len(context) == 0) or (isinstance(context, str) and not context.strip()):
        question = "Status dihubungi?"
        options = ["Bisa Dihubungi", "Tidak Dapat Dihubungi"]
        return {"question": question, "options": options}
    # Jika context sudah ada, lanjutkan ke OpenAI
    if isinstance(context, str):
        context = [{"q": context, "a": ""}]
    elif isinstance(context, list):
        pass
    else:
        context = []
    question_data = generate_question(topic, context)
    question_text = question_data.get("question")
    if not isinstance(question_text, str):
        question_text = str(question_text)
    return {"question": question_text, "options": question_data.get("options", [])}

@router.post("/answer")
def answer_endpoint(req: AnswerRequest):
    answer = req.manual_input if req.manual_input else req.selected_option
    prediction = process_customer_answer(answer)
    # Generate pertanyaan berikutnya secara dinamis menggunakan OpenAI
    next_question = generate_question(req.topic, answer)
    save_conversation_to_excel(req.customer_id, req.topic, req.question, answer, prediction)
    return {
        "prediction": prediction,
        "next_question": next_question
    }


# Endpoint prediksi status, promo, minat, estimasi pembayaran, alasan
@router.post("/predict")
def predict_final_endpoint(req: FinalPredictRequest):
    # Validasi Customer ID
    customer_id = req.customer_id if req.customer_id else None
    if not customer_id or str(customer_id).strip() == '':
        raise HTTPException(status_code=400, detail="Customer ID wajib diisi")

    # Proses percakapan: ekstrak seluruh Q&A
    qna_list = []
    for idx, item in enumerate(req.conversation):
        q = item.get("q", f"Pertanyaan_CS.{idx+1}")
        a = item.get("a", f"Jawaban_Pelanggan.{idx+1}")
        qna_list.append({"pertanyaan": q, "jawaban": a})

    # Prediksi status, promo, minat, estimasi pembayaran, alasan menggunakan OpenAI
    from app.services.gpt_service import predict_status_promo_openai
    answers = [item["jawaban"] for item in qna_list if "jawaban" in item and str(item["jawaban"]).strip()]
    prediction_result = predict_status_promo_openai(answers)

    # Output data lengkap
    output = {
        "Customer_ID": customer_id,
        "Mode": req.topic if hasattr(req, 'topic') else '-',
        "Percakapan": qna_list,
        "Prediction": prediction_result
    }
    return {"result": output}

@router.post("/next-question")
def next_question_endpoint(req: NextQuestionRequest):
    # Bangun context sebagai list pasangan Q&A
    conversation_history = []
    if req.conversation:
        for item in req.conversation:
            if isinstance(item, dict):
                q = str(item.get("q", ""))
                a = str(item.get("a", ""))
                conversation_history.append({"q": q, "a": a})
            else:
                conversation_history.append({"q": "", "a": str(item)})
    # Ambil customer_id dari session jika kosong
    customer_id = req.customer_id if req.customer_id else None
    if not customer_id or str(customer_id).strip() == "":
        import os
        customer_id = os.environ.get("CUSTOMER_ID", "")
    print(f"[DEBUG] Received conversation: {conversation_history}")
    for idx, item in enumerate(conversation_history):
        print(f"[DEBUG] Q{idx}: {item.get('q', '')} | A{idx}: {item.get('a', '')}")
    # Batasi percakapan maksimal 5 langkah
    if len(conversation_history) >= 5:
        answers = [item["a"] for item in conversation_history if "a" in item and str(item["a"]).strip()]
        from app.services.gpt_service import predict_status_promo_openai
        prediction_result = predict_status_promo_openai(answers)
        return {
            "is_last": True,
            "prediction": prediction_result
        }
    else:
        question_data = generate_question(req.topic, conversation_history)
        question_text = question_data.get("question")
        options = question_data.get("options", [])
        is_last = question_data.get("is_last", False)
        if is_last:
            answers = [item["a"] for item in conversation_history if "a" in item and str(item["a"]).strip()]
            from app.services.gpt_service import predict_status_promo_openai
            prediction_result = predict_status_promo_openai(answers)
            return {
                "is_last": True,
                "prediction": prediction_result
            }
        else:
            return {
                "is_last": False,
                "question": question_text,
                "options": options
            }
