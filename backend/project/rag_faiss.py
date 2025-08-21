# rag_faiss.py

import faiss
import pandas as pd
from openai import OpenAI
from sentence_transformers import SentenceTransformer

# --- 1. Load dataset ---
df = pd.read_csv("jawaban_pertanyaan_dataset.csv", encoding="latin1", sep=";")

# --- 2. Load embedding model (untuk vector DB) ---
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Kita pakai "Pertanyaan" untuk pencarian, "Jawaban" sebagai response
corpus = df["Pertanyaan"].tolist()
answers = df["Jawaban"].tolist()

# --- 3. Buat embedding ---
embeddings = embedder.encode(corpus, convert_to_numpy=True)

# --- 4. Simpan ke FAISS index ---
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

print(f"FAISS Index built with {index.ntotal} entries.")

# --- 5. Inisialisasi GPT client ---
client = OpenAI()

def rag_query(query: str, top_k: int = 3):
    # Embed query
    query_vec = embedder.encode([query], convert_to_numpy=True)
    
    # Cari top_k hasil terdekat
    distances, indices = index.search(query_vec, top_k)
    
    # Ambil hasil retrieval
    retrieved = [(corpus[i], answers[i]) for i in indices[0]]
    
    # Susun konteks untuk GPT
    context = "\n".join([f"- Pertanyaan: {q}\n  Jawaban: {a}" for q, a in retrieved])
    
    prompt = f"""
Kamu adalah asisten CS. 
Gunakan data berikut sebagai referensi jawaban:
{context}

Pertanyaan user: {query}
Jawaban yang tepat:
"""
    
    # Panggil GPT
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # bisa pakai gpt-3.5-turbo atau yang lain
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    
    return response.choices[0].message.content, retrieved

# --- 6. Coba query ---
if __name__ == "__main__":
    query = "Nomor saya tidak bisa dihubungi, kenapa ya?"
    answer, refs = rag_query(query)
    print("=== Jawaban GPT ===")
    print(answer)
    print("\n=== Data Referensi ===")
    for q, a in refs:
        print(f"Q: {q}\nA: {a}\n")
