# app/api/v1/endpoints/predict.py
from fastapi import APIRouter
from pydantic import BaseModel
import os
import pickle
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

router = APIRouter()

# --- Tentukan folder backend (folder di atas app) ---
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
# Struktur: backend/app/api/v1/endpoints/predict.py -> naik 4 level ke backend/

# --- Path model pickle ---
model_path = os.path.join(backend_dir, "models", "chatbot_model.pkl")

# --- Cek apakah file ada ---
use_pickle = os.path.exists(model_path)
print(f"Looking for model at: {model_path}\nExists? {use_pickle}")

# --- Load model pickle kalau ada ---
if use_pickle:
    with open(model_path, "rb") as f:
        model, vectorizer, qa_data = pickle.load(f)
else:
    print(f"Warning: Model tidak ditemukan di {model_path}")
    model = None
    vectorizer = None
    qa_data = []

# --- FAISS fallback engine ---
class ChatbotEngine:
    def __init__(self, dataset_path=None):
        if dataset_path is None:
            dataset_path = os.path.join(backend_dir, "dataset", "qa_pairs.csv")
        
        if not os.path.exists(dataset_path):
            print(f"Warning: Dataset tidak ditemukan di {dataset_path}")
            self.df = pd.DataFrame(columns=["pertanyaan","jawaban"])
            self.embeddings = np.zeros((0,384))
            self.index = faiss.IndexFlatL2(384)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            return

        # Load CSV
        self.df = pd.read_csv(dataset_path)
        # Load embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        # Encode jawaban
        self.embeddings = self.model.encode(self.df["jawaban"].tolist(), convert_to_numpy=True)
        # Buat FAISS index
        d = self.embeddings.shape[1]
        self.index = faiss.IndexFlatL2(d)
        self.index.add(self.embeddings)

    def get_next_question(self, user_answer: str):
        if self.df.empty:
            return "Dataset belum tersedia."
        query_vec = self.model.encode([user_answer], convert_to_numpy=True)
        D, I = self.index.search(query_vec, k=1)
        idx = I[0][0]
        return self.df.iloc[idx]["pertanyaan"]

# Buat instance FAISS engine
faiss_engine = ChatbotEngine()

# --- Request schema ---
class QueryRequest(BaseModel):
    query: str

# --- Endpoint predict ---
@router.post("/predict")
async def predict(req: QueryRequest):
    if use_pickle and model is not None:
        # Gunakan model pickle
        X = vectorizer.transform([req.query])
        _, indices = model.kneighbors(X)
        idx = indices[0][0]
        return {
            "query": req.query,
            "predicted_question": qa_data[idx][0],
            "predicted_answer": qa_data[idx][1],
        }
    else:
        # fallback FAISS
        next_q = faiss_engine.get_next_question(req.query)
        return {
            "query": req.query,
            "next_question": next_q
        }
