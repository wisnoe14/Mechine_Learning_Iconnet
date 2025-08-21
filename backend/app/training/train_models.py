
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from joblib import dump
import os

# Path dataset dan output model
DATASET_PATH = '../../../dataset/dataset_filled_status_promo.xlsx'
MODEL_DIR = '../model'
os.makedirs(MODEL_DIR, exist_ok=True)

# Load dataset utama
print('Loading dataset...')
df = pd.read_excel(DATASET_PATH)

# Fitur dan target untuk status & promo
features = [col for col in df.columns if col not in ['status', 'promo']]
X = df[features]

# Preprocessing: label encoding untuk kolom kategorikal
for col in X.select_dtypes(include=['object']).columns:
    X[col] = LabelEncoder().fit_transform(X[col].astype(str))

# Model untuk prediksi status
if 'status' in df.columns:
    y_status = LabelEncoder().fit_transform(df['status'].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(X, y_status, test_size=0.2, random_state=42)
    model_status = RandomForestClassifier(n_estimators=100, random_state=42)
    model_status.fit(X_train, y_train)
    dump(model_status, os.path.join(MODEL_DIR, 'model_status.pkl'))
    print('Model status saved.')

# Model untuk prediksi promo
if 'promo' in df.columns:
    y_promo = LabelEncoder().fit_transform(df['promo'].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(X, y_promo, test_size=0.2, random_state=42)
    model_promo = RandomForestClassifier(n_estimators=100, random_state=42)
    model_promo.fit(X_train, y_train)
    dump(model_promo, os.path.join(MODEL_DIR, 'model_promo.pkl'))
    print('Model promo saved.')

print('Training complete.')

# --- Training model intent untuk pertanyaan CS ---
MODEL_CS_DIR = MODEL_DIR

# Cari kolom yang sesuai
mode_col = next((col for col in df.columns if col.startswith('Mode')), None)
pertanyaan_col = next((col for col in df.columns if col.startswith('Pertanyaan_CS')), None)
jawaban_col = next((col for col in df.columns if col.startswith('Jawaban_Pelanggan')), None)

if mode_col and pertanyaan_col and jawaban_col:
    # Gabungkan pertanyaan + jawaban sebagai "teks"
    df['text'] = df[mode_col].astype(str) + " | " + df[pertanyaan_col].astype(str) + " | " + df[jawaban_col].astype(str)
    # Intent: bisa berupa pertanyaan berikutnya atau label khusus
    if 'Intent' not in df.columns:
        df['Intent'] = df[pertanyaan_col]  # fallback: gunakan pertanyaan CS sebagai intent
    X_text = df['text'].astype(str)
    y_intent = df['Intent'].astype(str)
    # TF-IDF
    vectorizer = TfidfVectorizer(max_features=1000)
    X_vec = vectorizer.fit_transform(X_text)
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X_vec, y_intent, test_size=0.2, random_state=42)
    clf = LogisticRegression(max_iter=500)
    clf.fit(X_train, y_train)
    # Simpan model
    dump(clf, os.path.join(MODEL_CS_DIR, 'model_cs.pkl'))
    dump(vectorizer, os.path.join(MODEL_CS_DIR, 'vectorizer_cs.pkl'))
    print("✅ Model pertanyaan CS per mode berhasil disimpan.")
else:
    print('❌ Kolom Mode, Pertanyaan_CS, atau Jawaban_Pelanggan tidak ditemukan di dataset.')