from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from joblib import load

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../model/model_openai.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), '../../model/vectorizer_openai.pkl')

try:
    clf_intent = load(MODEL_PATH)
    vectorizer = load(VECTORIZER_PATH)
except Exception as e:
    clf_intent = None
    vectorizer = None

class QuestionRequest(BaseModel):
    question: str

@router.post('/predict-intent')
def predict_intent_api(req: QuestionRequest):
    if clf_intent is None or vectorizer is None:
        raise HTTPException(status_code=500, detail='Model not available')
    X_vec = vectorizer.transform([req.question])
    intent = clf_intent.predict(X_vec)[0]
    return {"intent": intent}
