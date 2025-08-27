
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
    # Jika confidence rendah (<0.6) atau None, panggil OpenAI untuk pertanyaan baru
    if confidence is None or confidence < 0.6:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Kamu adalah asisten customer service Iconnet yang ramah. Tugasmu hanya mengajukan satu pertanyaan lanjutan yang relevan untuk customer service, bukan label intent, bukan jawaban, dan bukan penjelasan. Format output harus berupa satu pertanyaan saja."},
                {"role": "user", "content": f"Percakapan: {prompt}. Mohon berikan satu pertanyaan customer service yang relevan untuk langkah selanjutnya."}
            ],
            temperature=0.7,
            max_tokens=100
        )
        result["question"] = response.choices[0].message.content.strip()
    return result


EXCEL_PATH = "conversations.xlsx"

def generate_question(topic: str, context: str = "") -> dict:
    # context sekarang adalah list pasangan Q&A
    mode = topic
    conversation_str = ""
    if isinstance(context, list):
        # Format percakapan sebagai string untuk prompt
        for idx, pair in enumerate(context):
            q = pair.get("q", "")
            a = pair.get("a", "")
            if q:
                conversation_str += f"Q{idx+1}: {q}\n"
            if a:
                conversation_str += f"A{idx+1}: {a}\n"
    else:
        conversation_str = str(context)

    prompt = (
        f"Topik: {mode}\nPercakapan:\n{conversation_str}\n"
        "Tugasmu: Buat satu pertanyaan customer service yang relevan dan lanjutan, jangan mengulang pertanyaan sebelumnya, jangan mengirim label intent, jangan mengirim jawaban, dan jangan penjelasan. Format output HARUS berupa satu pertanyaan customer service yang logis untuk langkah berikutnya, sesuai dengan percakapan di atas."
    ).strip()
    print("[DEBUG] Prompt ke OpenAI:", prompt)
    response = generate_chatgpt_response(prompt)
    print(f"[DEBUG] Model local: {response.get('model_local')}")
    print(f"[DEBUG] OpenAI question: {response.get('question')}")
    print(f"[DEBUG] Confidence: {response.get('confidence')}")

    # Ambil jawaban terakhir dari context
    last_answer = ""
    if isinstance(context, list) and len(context) > 0:
        last_answer = str(context[-1].get("a", "")).strip().lower()

    use_local_model = response.get('confidence', 0) >= 0.6
    question_text = ""
    options = []
    # Path dataset absolut dari root backend/app
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dataset', 'dataset_filled_status_promo.xlsx'))
    try:
        df_qa = pd.read_excel(dataset_path)
        # Filter data sesuai mode
        if 'Mode' in df_qa.columns:
            df_qa_mode = df_qa[df_qa['Mode'].str.lower().str.strip() == topic.lower().strip()]
        else:
            df_qa_mode = df_qa
        # Validate columns
        if 'Jawaban_Pelanggan' not in df_qa_mode.columns or 'Pertanyaan_CS' not in df_qa_mode.columns:
            raise ValueError("Kolom 'Jawaban_Pelanggan' atau 'Pertanyaan_CS' tidak ditemukan di dataset.")
    except Exception as e:
        print(f"[ERROR] Gagal load dataset: {e}")
        df_qa_mode = None

    if use_local_model and df_qa_mode is not None:
        try:
            # Ambil pertanyaan dan opsi jawaban berdasarkan urutan step
            pertanyaan_cols = [col for col in df_qa_mode.columns if col.startswith('Pertanyaan_CS.')]
            jawaban_cols = [col for col in df_qa_mode.columns if col.startswith('Jawaban_Pelanggan.')]
            # Urutkan kolom berdasarkan index
            def sort_by_index(col_list, prefix):
                def extract_idx(col):
                    try:
                        return int(col.replace(prefix, ''))
                    except:
                        return 0
                return sorted(col_list, key=lambda col: extract_idx(col))
            pertanyaan_cols = sort_by_index(pertanyaan_cols, 'Pertanyaan_CS.')
            jawaban_cols = sort_by_index(jawaban_cols, 'Jawaban_Pelanggan.')
            step = len([item for item in context if str(item.get('a', '')).strip()])
            num_steps = min(len(pertanyaan_cols), len(jawaban_cols))
            if step >= num_steps:
                print(f"[ERROR] Step ({step}) >= num_steps ({num_steps}). Kolom pertanyaan: {pertanyaan_cols}, kolom jawaban: {jawaban_cols}")
                return {"question": None, "options": []}
            # Ambil pertanyaan dan opsi jawaban dari step yang sesuai
            try:
                question_text = df_qa_mode[pertanyaan_cols[step]].dropna().iloc[0]
            except Exception as e:
                print(f"[ERROR] Gagal ambil pertanyaan dari kolom {pertanyaan_cols[step]}: {e}")
            try:
                options = df_qa_mode[jawaban_cols[step]].dropna().unique().tolist()
            except Exception as e:
                print(f"[ERROR] Gagal ambil opsi jawaban dari kolom {jawaban_cols[step]}: {e}")
        except Exception as e:
            print(f"[ERROR] Gagal proses pertanyaan/jawaban dari dataset: {e}")
    if not question_text:
        question_text = response.get("question") or response.get("model_local") or ""
    if not options and df_qa_mode is not None:
        try:
            # Fallback opsi jawaban dari kolom jawaban step saat ini
            pertanyaan_cols = [col for col in df_qa_mode.columns if col.startswith('Pertanyaan_CS.')]
            jawaban_cols = [col for col in df_qa_mode.columns if col.startswith('Jawaban_Pelanggan.')]
            pertanyaan_cols = sort_by_index(pertanyaan_cols, 'Pertanyaan_CS.')
            jawaban_cols = sort_by_index(jawaban_cols, 'Jawaban_Pelanggan.')
            step = len([item for item in context if str(item.get('a', '')).strip()])
            # Tambahkan +1 agar pertanyaan/jawaban tidak berulang
            next_step = step + 1 if (step + 1) < len(jawaban_cols) else step
            if next_step < len(jawaban_cols):
                options = df_qa_mode[jawaban_cols[next_step]].dropna().unique().tolist()
        except Exception as e:
            print(f"[ERROR] Gagal ambil opsi jawaban dari dataset: {e}")
    # Jangan fallback ke opsi statis jika data tersedia
    if (not options or len(options) == 0) and df_qa_mode is not None:
        try:
            pertanyaan_cols = [col for col in df_qa_mode.columns if col.startswith('Pertanyaan_CS.')]
            jawaban_cols = [col for col in df_qa_mode.columns if col.startswith('Jawaban_Pelanggan.')]
            pertanyaan_cols = sorted(pertanyaan_cols, key=lambda col: int(col.replace('Pertanyaan_CS.', '')))
            jawaban_cols = sorted(jawaban_cols, key=lambda col: int(col.replace('Jawaban_Pelanggan.', '')))
            step = len([item for item in context if str(item.get('a', '')).strip()])
            # Tambahkan +1 agar pertanyaan/jawaban tidak berulang
            next_step = step + 1 if (step + 1) < len(jawaban_cols) else step
            if next_step < len(jawaban_cols):
                options = df_qa_mode[jawaban_cols[next_step]].dropna().unique().tolist()
        except Exception as e:
            print(f"[ERROR] Fallback opsi jawaban dinamis gagal: {e}")
    # Jika tetap kosong, baru fallback ke opsi statis
    if not options or len(options) == 0:
        options = ["Ya", "Tidak", "Mungkin", "Butuh info lebih lanjut"]
    print(f"[DEBUG] Opsi yang dikirim ke frontend: {options}")
    result = {
        "model_local": response.get("model_local"),
        "question": question_text,
        "options": options,
        "source": "local" if use_local_model else "openai"
    }
    return result

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
