import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import pickle
import os

# Path CSV
csv_path = os.path.join("dataset", "qa_pairs.csv")
df = pd.read_csv(csv_path)

# Vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["jawaban"].tolist())

# Model KNN
model = NearestNeighbors(n_neighbors=1, metric="cosine")
model.fit(X)

# Buat QA data list
qa_data = list(zip(df["pertanyaan"].tolist(), df["jawaban"].tolist()))

# Simpan model
os.makedirs("models", exist_ok=True)
with open("models/chatbot_model.pkl", "wb") as f:
    pickle.dump((model, vectorizer, qa_data), f)

print("✅ Model pickle berhasil dibuat di models/chatbot_model.pkl")
