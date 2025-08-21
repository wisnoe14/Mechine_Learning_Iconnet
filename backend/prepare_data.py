import pandas as pd

# Load dataset
df = pd.read_csv("dataset_filled_status_promo.csv")

# Ambil hanya kolom Pertanyaan_CS.1 dan Jawaban_Pelanggan.1 (bisa disesuaikan)
pairs = []
for i, row in df.iterrows():
    for q_col, a_col in [
        ("Pertanyaan_CS.1", "Jawaban_Pelanggan.1"),
        ("Pertanyaan_CS.2", "Jawaban_Pelanggan.2"),
        ("Pertanyaan_CS.3", "Jawaban_Pelanggan.3"),
    ]:
        if pd.notna(row[q_col]) and pd.notna(row[a_col]):
            pairs.append({
                "pertanyaan": row[q_col],
                "jawaban": row[a_col]
            })

# Simpan hasilnya ke CSV
pd.DataFrame(pairs).to_csv("app/dataset/qa_pairs.csv", index=False)
print(f"Saved {len(pairs)} pairs to dataset/qa_pairs.csv")
