import os
from joblib import load

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../training/models/model_cs.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), '../training/models/vectorizer_cs.pkl')

clf_intent = load(MODEL_PATH)
vectorizer = load(VECTORIZER_PATH)

def predict_intent(question: str) -> str:
    X_vec = vectorizer.transform([question])
    intent = clf_intent.predict(X_vec)[0]
    return intent

if __name__ == '__main__':
    pertanyaan = input('Masukkan pertanyaan: ')
    hasil_intent = predict_intent(pertanyaan)
    print(f"Intent: {hasil_intent}")
