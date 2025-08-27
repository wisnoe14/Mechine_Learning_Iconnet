import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from joblib import dump
from joblib import load
import os

DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../dataset/dataset_filled_status_promo.xlsx'))
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# Load dataset utama
print('Loading dataset...')
df = pd.read_excel(DATASET_PATH)

# Fungsi prediksi akhir berdasarkan jawaban user
def predict_final_status(answers):
    # Dummy: Gabungkan jawaban user sebagai fitur
    # Implementasi sebenarnya: lakukan preprocessing dan prediksi dengan model
    # Contoh: load model dan prediksi
    model_status_path = os.path.join(MODEL_DIR, 'model_status.pkl')
    model_promo_path = os.path.join(MODEL_DIR, 'model_promo.pkl')
    alasan_kalimat = " ".join([str(j) for j in answers if j])
    if alasan_kalimat:
        alasan_kalimat = f"Ringkasan jawaban pelanggan: {alasan_kalimat.strip()}"
    else:
        alasan_kalimat = "Belum ada jawaban yang cukup untuk prediksi."
    result = {
        "status": "Tidak Bisa Dihubungi",
        "minat": "Rendah",
        "promo": "Tidak Ada Promo",
        "estimasi_pembayaran": "0",
        "alasan": alasan_kalimat
    }
    if os.path.exists(model_status_path) and os.path.exists(model_promo_path):
        # Dummy: gunakan array dengan jumlah fitur sesuai training
        X = [[0]*len(features)]
        model_status = load(model_status_path)
        model_promo = load(model_promo_path)
        status_pred = model_status.predict(X)[0]
        promo_pred = model_promo.predict(X)[0]
        result["status"] = str(status_pred)
        result["promo"] = str(promo_pred)
        result["minat"] = "Tinggi" if len(answers) > 2 else "Rendah"
        result["estimasi_pembayaran"] = str(100000 * len(answers))
        result["alasan"] = f"Prediksi berdasarkan {len(answers)} jawaban."
    return result



# Fitur dan target untuk status & promo
features = [col for col in df.columns if col not in ['Status', 'Jenis_Promo']]
X = df[features]

# Preprocessing: label encoding untuk kolom kategorikal
for col in X.select_dtypes(include=['object']).columns:
    X[col] = LabelEncoder().fit_transform(X[col].astype(str))


# Model untuk prediksi Status
if 'Status' in df.columns:
    y_status = LabelEncoder().fit_transform(df['Status'].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(X, y_status, test_size=0.2, random_state=42)
    model_status = RandomForestClassifier(n_estimators=100, random_state=42)
    model_status.fit(X_train, y_train)
    dump(model_status, os.path.join(MODEL_DIR, 'model_status.pkl'))
    print('Model Status saved.')


# Model untuk prediksi Jenis_Promo
if 'Jenis_Promo' in df.columns:
    y_promo = LabelEncoder().fit_transform(df['Jenis_Promo'].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(X, y_promo, test_size=0.2, random_state=42)
    model_promo = RandomForestClassifier(n_estimators=100, random_state=42)
    model_promo.fit(X_train, y_train)
    dump(model_promo, os.path.join(MODEL_DIR, 'model_promo.pkl'))
    print('Model Jenis_Promo saved.')


# Model untuk prediksi Minat
if 'Minat' in df.columns:
    y_minat = LabelEncoder().fit_transform(df['Minat'].astype(str))
    X_train, X_test, y_train, y_test = train_test_split(X, y_minat, test_size=0.2, random_state=42)
    model_minat = RandomForestClassifier(n_estimators=100, random_state=42)
    model_minat.fit(X_train, y_train)
    dump(model_minat, os.path.join(MODEL_DIR, 'model_minat.pkl'))
    print('Model Minat saved.')

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