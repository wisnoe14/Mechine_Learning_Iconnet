
import pandas as pd
import os
from app.core.config import settings
from app.services.predict_openai import predict_intent_with_confidence
from openai import OpenAI


client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_chatgpt_response(prompt: str) -> dict:
    """Gabungan: model lokal dulu, jika confidence rendah, panggil OpenAI."""
    intent, confidence = predict_intent_with_confidence(prompt)
    result = {"model_local": intent, "confidence": confidence}
    # Jika confidence rendah (<0.6) atau None, panggil OpenAI
    if confidence is None or confidence < 0.6:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Kamu adalah asisten CS yang ramah. Jika relevan, tawarkan promo Iconnet kepada pelanggan."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        result["openai"] = response.choices[0].message.content
    return result


EXCEL_PATH = "conversations.xlsx"

def generate_question(topic: str, context: str = "") -> dict:
    prompt = f"{topic} {context}".strip()
    return generate_chatgpt_response(prompt)

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
    return generate_chatgpt_response(answer)
