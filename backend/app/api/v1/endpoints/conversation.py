# --- IMPORTS & ROUTER ---
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.gpt_service import generate_question, save_conversation_to_excel, process_customer_answer
from app.training.train_models import predict_final_status

router = APIRouter()

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
    context: str = ""

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
    question_data = generate_question(topic, req.context)
    save_conversation_to_excel(req.customer_id, topic, question_data.get("model_local", question_data), None, req.context)
    return {"question": question_data.get("model_local", question_data), "options": question_data.get("options", [])}

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

@router.post("/predict")
def predict_final_endpoint(req: FinalPredictRequest):
    # Ambil seluruh jawaban user dari percakapan
    answers = [item["a"] for item in req.conversation if "a" in item]
    # Prediksi status, minat, promo, estimasi pembayaran, alasan
    result = predict_final_status(answers)
    return {"prediction": result}

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
    print(f"[DEBUG] Received conversation: {conversation_history}")
    # Print all Q&A pairs
    for idx, item in enumerate(conversation_history):
        print(f"[DEBUG] Q{idx}: {item.get('q', '')} | A{idx}: {item.get('a', '')}")
    question_data = generate_question(req.topic, conversation_history)
    # Only count Q&A pairs with non-empty answers
    next_idx = len([item for item in conversation_history if item.get('a', '').strip()])
    print(f"[DEBUG] next_idx (non-empty answers): {next_idx}")
    # Get number of Q&A steps from dataset
    from app.services.gpt_service import pd, os
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'dataset', 'dataset_filled_status_promo.xlsx'))
    try:
        df_qa = pd.read_excel(dataset_path)
        def sort_by_index(col_list, prefix):
            def extract_idx(col):
                try:
                    return int(col.replace(prefix, '').replace('.', ''))
                except:
                    return 0
            return sorted(col_list, key=lambda col: extract_idx(col))

        jawaban_cols = sort_by_index([col for col in df_qa.columns if col.startswith('Jawaban_Pelanggan')], 'Jawaban_Pelanggan.')
        pertanyaan_cols = sort_by_index([col for col in df_qa.columns if col.startswith('Pertanyaan_CS')], 'Pertanyaan_CS.')
        num_steps = min(len(jawaban_cols), len(pertanyaan_cols))
    except Exception as e:
        print(f"[ERROR] Gagal load dataset: {e}")
        num_steps = 0
    print(f"[DEBUG] num_steps in dataset: {num_steps}")
    question_text = question_data.get("question") or question_data.get("model_local")
    if next_idx >= num_steps or not question_data or not question_text:
        # Last question reached, return prediction
        answers = [item["a"] for item in req.conversation if "a" in item and str(item["a"]).strip()]
        print(f"[DEBUG] Answers used for prediction: {answers}")
        result = predict_final_status(answers)
        return {
            "is_last": True,
            "prediction": result
        }
    options = question_data.get("options", [])
    return {
        "is_last": False,
        "question": question_text,
        "options": options
    }
