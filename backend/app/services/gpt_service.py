import hashlib
import os
from app.core.config import settings
from openai import OpenAI
from functools import lru_cache

# Cache dictionary untuk response OpenAI
_openai_cache = {}

def cache_key(*args, **kwargs):
    key_str = str(args) + str(kwargs)
    return hashlib.md5(key_str.encode()).hexdigest()
def predict_status_promo_openai(answers: list) -> dict:
    """
    Prediksi status dan promo menggunakan OpenAI berdasarkan seluruh jawaban user.
    """
    percakapan = " | ".join([str(a) for a in answers if a])
    prompt = (
        f"Berdasarkan percakapan berikut: {percakapan}. "
        "Prediksikan status pelanggan (pilihan: Pelanggan tidak dapat dihubungi, Closing, Pelanggan dapat dihubungi, Bersedia Membayar) "
        "dan jenis promo yang sesuai (pilihan: Tidak Ada Promo, Promo Diskon, Promo Cashback, Promo Gratis Bulan, Promo Lainnya). "
        "Format output: Status: <status>, Promo: <jenis_promo>, Estimasi Pembayaran: <estimasi jika ada, jika tidak tulis 'Belum tersedia'>, Alasan: <ringkas alasan dari jawaban>. Jawab maksimal 7 kata per field."
    )
    key = cache_key(prompt, "predict_status_promo_openai")
    if key in _openai_cache:
        content = _openai_cache[key]
    else:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "Kamu adalah asisten customer service Iconnet yang profesional. Jawab hanya sesuai format yang diminta. Jawab maksimal 7 kata per field."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=40
        )
        content = response.choices[0].message.content.strip()
        _openai_cache[key] = content
    # Parsing output sederhana
    result = {}
    for line in content.split(','):
        if ':' in line:
            k, v = line.split(':', 1)
            result[k.strip().lower().replace(' ', '_')] = v.strip()
    return result


client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_chatgpt_response(prompt: str) -> dict:
    """
    Generate response using OpenAI for customer service.
    """
    key = cache_key(prompt, "generate_chatgpt_response")
    if key in _openai_cache:
        question = _openai_cache[key]
    else:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "Kamu adalah asisten customer service Iconnet yang ramah. Jawab satu pertanyaan singkat, maksimal 7 kata."},
                {"role": "user", "content": f"Percakapan: {prompt}. Mohon berikan satu pertanyaan customer service yang relevan untuk langkah selanjutnya. Jawab maksimal 7 kata."}
            ],
            temperature=0.5,
            max_tokens=20
        )
        question = response.choices[0].message.content.strip()
        _openai_cache[key] = question
    return {"question": question}

def generate_question(topic: str, context: str = "") -> dict:
    """
    Generate a customer service question and 4 answer options using OpenAI, based on topic and conversation context.
    """
    if context is None or str(context).lower() == 'nan' or str(context).strip() == '':
        context = ""
    if isinstance(topic, dict):
        mode_raw = topic.get('mode', str(topic))
        status_raw = topic.get('status_dihubungi', topic.get('status', ''))
    else:
        mode_raw = str(topic)
        status_raw = ''
    mode = mode_raw.strip().capitalize()
    status = status_raw.strip()
    history = context if isinstance(context, list) else []

    percakapan = " | ".join([str(q) for q in history if q]) if history else ""

    # Prompt for question generation
    prompt_q = (
        f"Mode: {mode}. Status: {status}. Percakapan: {percakapan}. "
        "Tulis pertanyaan CS singkat dan relevan. Satu kalimat saja."
    )
    key_q = cache_key(prompt_q, "generate_question_q")
    if key_q in _openai_cache:
        question = _openai_cache[key_q]
    else:
        response_q = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "Tugasmu hanya membuat satu pertanyaan CS singkat dan relevan. Jawab maksimal 7 kata."},
                {"role": "user", "content": prompt_q + " Jawab maksimal 7 kata."}
            ],
            temperature=0.5,
            max_tokens=20
        )
        question = response_q.choices[0].message.content.strip()
        _openai_cache[key_q] = question

    # Prompt for answer options generation
    prompt_opt = (
        f"Buat 4 opsi jawaban singkat untuk pertanyaan: '{question}'. Pisahkan dengan |."
    )
    key_opt = cache_key(prompt_opt, "generate_question_opt")
    if key_opt in _openai_cache:
        options_raw = _openai_cache[key_opt]
    else:
        response_opt = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "Jawab hanya 4 opsi singkat, dipisahkan |. Maksimal 7 kata per opsi."},
                {"role": "user", "content": prompt_opt + " Jawab maksimal 7 kata per opsi."}
            ],
            temperature=0.5,
            max_tokens=20
        )
        options_raw = response_opt.choices[0].message.content.strip()
        _openai_cache[key_opt] = options_raw
    options = [opt.strip() for opt in options_raw.split('|') if opt.strip()]

    return {
        "question": question,
        "options": options,
        "is_last": False,
        "allow_manual": True
    }

def process_customer_answer(answer: str) -> dict:
    return generate_chatgpt_response(answer)

def save_conversation_to_excel(*args, **kwargs):
    pass
