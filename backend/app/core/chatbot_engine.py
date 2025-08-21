# app/api/v1/endpoints/predict.py
from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os

router = APIRouter()

# --- Class Chatbot Engine ---
class ChatbotEngine:
    def __init__(self, dataset_path=None):
        if dataset_path is None:
            # Path relatif dari folder app/core ke folder dataset di luar app
            dataset_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dataset", "qa_pairs.csv")
        
        if not os.path.exists(dataset_path):
            print(f"Warning: Dataset tidak ditemukan di {dataset_path}")
            self.df = pd.DataFrame(columns=["pertanyaan", "jawaban"])
            self.embeddings = np.zeros((0,384))  # bentuk vektor dummy
            self.index = faiss.IndexFlatL2(384)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")  # tetap load model
            return

        # Load dataset
        self.df = pd.read_csv(dataset_path)

        # Load embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Encode jawaban pelanggan
        self.embeddings = self.model.encode(self.df["jawaban"].tolist(), convert_to_numpy=True)

        # Buat FAISS index
        d = self.embeddings.shape[1]  # dimensi vektor
        self.index = faiss.IndexFlatL2(d)
        self.index.add(self.embeddings)

    def get_next_question(self, user_answer: str):
        if self.df.empty:
            return "Dataset belum tersedia."

        # Encode input user
        query_vec = self.model.encode([user_answer], convert_to_numpy=True)

        # Cari jawaban terdekat
        D, I = self.index.search(query_vec, k=1)
        idx = I[0][0]

        pertanyaan_selanjutnya = self.df.iloc[idx]["pertanyaan"]
        return pertanyaan_selanjutnya

# --- Buat instance engine saat server start ---
engine = ChatbotEngine()

# --- Schema request ---
class PredictRequest(BaseModel):
    query: str

# --- Endpoint ---
@router.post("/predict")
def predict(req: PredictRequest):
    pertanyaan = engine.get_next_question(req.query)
    return {"next_question": pertanyaan}
