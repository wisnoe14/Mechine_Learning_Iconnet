import React, { useState } from "react";

const TOPICS = [
  { key: "telecollection", label: "Telecollection (Penagihan)" },
  { key: "retention", label: "Retention (Pencegahan Berhenti)" },
  { key: "winback", label: "Winback (Menggaet Kembali)" },
];

export default function Home() {
  const [topic, setTopic] = useState(TOPICS[0].key);
  const [questions, setQuestions] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [customerAnswer, setCustomerAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulasi: generate pertanyaan dari GPT-4o-mini
  const handleGenerateQuestions = () => {
    setLoading(true);
    setTimeout(() => {
      setQuestions([
        `Pertanyaan 1 untuk topik ${topic}`,
        `Pertanyaan 2 untuk topik ${topic}`,
        `Pertanyaan 3 untuk topik ${topic}`,
      ]);
      setConversation([]);
      setResult(null);
      setLoading(false);
    }, 800);
  };

  // Simulasi: proses jawaban pelanggan
  const handleProcessAnswer = () => {
    setLoading(true);
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        { q: questions[conversation.length], a: customerAnswer },
      ]);
      setCustomerAnswer("");
      // Jika sudah 3 jawaban, tampilkan hasil prediksi
      if (conversation.length + 1 === 3) {
        setResult({
          status: "Aktif",
          minat: "Tinggi",
          promo: "Diskon 10%",
          estimasi_pembayaran: "Rp 250.000",
          alasan: "Pelanggan tertarik dengan promo dan layanan."
        });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-primary-700 mb-6">
          Simulasi CS AI ICONNET
        </h1>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Pilih Topik:</label>
          <select
            className="select select-bordered w-full"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          >
            {TOPICS.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary w-full mb-6"
          onClick={handleGenerateQuestions}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Generate Pertanyaan"}
        </button>
        {questions.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Pertanyaan:</div>
            <ol className="list-decimal ml-6 space-y-1">
              {questions.map((q, idx) => (
                <li key={idx} className="text-gray-700">{q}</li>
              ))}
            </ol>
          </div>
        )}
        {questions.length > 0 && conversation.length < 3 && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Jawaban untuk: <span className="text-blue-700">{questions[conversation.length]}</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={customerAnswer}
              onChange={(e) => setCustomerAnswer(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-success w-full mt-2"
              onClick={handleProcessAnswer}
              disabled={loading || !customerAnswer}
            >
              {loading ? "Memproses..." : "Kirim Jawaban"}
            </button>
          </div>
        )}
        {conversation.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Riwayat Percakapan:</div>
            <ul className="space-y-1">
              {conversation.map((item, idx) => (
                <li key={idx} className="text-gray-600">
                  <span className="font-bold">Q{idx + 1}:</span> {item.q}<br />
                  <span className="font-bold">A{idx + 1}:</span> {item.a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border">
            <div className="mb-2">
              <span className="font-bold">Status:</span> <span className="badge badge-success">{result.status}</span>
            </div>
            <div className="mb-2">
              <span className="font-bold">Minat:</span> <span className="badge badge-info">{result.minat}</span>
            </div>
            <div className="mb-2">
              <span className="font-bold">Promo:</span> <span className="badge badge-warning">{result.promo}</span>
            </div>
            <div className="mb-2">
              <span className="font-bold">Estimasi Bayar:</span> <span className="badge badge-outline">{result.estimasi_pembayaran}</span>
            </div>
            <div className="mb-2">
              <span className="font-bold">Alasan (AI):</span>
              <div className="mt-1 p-3 bg-primary-50 rounded text-primary-800">
                {result.alasan}
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} ICONNET CS AI Simulation
      </footer>
    </div>
  );
}
