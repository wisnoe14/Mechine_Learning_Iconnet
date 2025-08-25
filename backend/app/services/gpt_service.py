from openai import OpenAI
import pandas as pd
import os
from app.core.config import settings
from app.services.predict_openai import predict_intent

def generate_chatgpt_response(prompt: str) -> str:
    """Generate a response from GPT model based on the given prompt."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Kamu adalah asisten CS yang ramah. Jika relevan, tawarkan promo Iconnet kepada pelanggan."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=200
    )
    return response.choices[0].message.content

client = OpenAI(api_key=settings.OPENAI_API_KEY)

EXCEL_PATH = "conversations.xlsx"

def generate_question(topic: str, context: str = "") -> str:
    prompt = f"Buatkan satu pertanyaan untuk topik {topic} dalam konteks: {context}"
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Kamu adalah asisten CS yang ramah. Jika relevan, tawarkan promo Iconnet kepada pelanggan."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=100
    )
    return response.choices[0].message.content

def save_conversation_to_excel(customer_id, topic, question, answer, extra):
    data = {
        "customer_id": [customer_id],
        "topic": [topic],
        "question": [question],
        "answer": [answer],
        "extra": [extra]
    }
    df = pd.DataFrame(data)
    if os.path.exists(EXCEL_PATH):
        df_existing = pd.read_excel(EXCEL_PATH)
        df = pd.concat([df_existing, df], ignore_index=True)
    df.to_excel(EXCEL_PATH, index=False)

def process_customer_answer(answer: str) -> dict:
    # Gunakan model untuk prediksi intent
    intent = predict_intent(answer)
    return {
        "intent": intent
    }
