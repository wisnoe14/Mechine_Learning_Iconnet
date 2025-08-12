import React, { useState } from "react";

//=========== TIPE DATA & KONSTANTA ===========//
type ConversationItem = {
  q: string;
  a: string;
};

type ResultType = {
  status: string;
  minat: string;
  promo: string;
  estimasi_pembayaran: string;
  alasan: string;
} | null;

const TOPICS = [
  { key: "telecollection", label: "Telecollection (Penagihan)" },
  { key: "retention", label: "Retention (Pencegahan Berhenti)" },
  { key: "winback", label: "Winback (Menggaet Kembali)" },
];

//=========== KOMPONEN UI LOKAL ===========//

/**
 * Komponen untuk menampilkan daftar pertanyaan yang dihasilkan.
 */
const QuestionList: React.FC<{ questions: string[] }> = ({ questions }) => {
  if (questions.length === 0) return null;
  return (
    <div className="border-t border-slate-200 pt-6">
      <h3 className="font-semibold text-slate-700 text-lg mb-3">Daftar Pertanyaan:</h3>
      <ol className="list-decimal pl-5 space-y-2 text-slate-600">
        {questions.map((q, idx) => (
          <li key={idx}>{q}</li>
        ))}
      </ol>
    </div>
  );
};

/**
 * Komponen untuk input jawaban dari pengguna.
 */
const AnswerInput: React.FC<{
  question: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}> = ({ question, value, onChange, onSubmit, loading }) => (
  <div className="border-t border-slate-200 pt-6">
    <label htmlFor="customer-answer" className="block text-sm font-medium text-slate-600 mb-2">
      Jawaban untuk: <span className="font-semibold text-sky-700">{question}</span>
    </label>
    <input
      id="customer-answer"
      className="w-full rounded-md border-slate-300 px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      placeholder="Ketik jawaban Anda..."
      onKeyUp={(e) => e.key === "Enter" && !loading && value && onSubmit()}
    />
    <button
      className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onSubmit}
      disabled={loading || !value}
    >
      Kirim Jawaban
    </button>
  </div>
);

/**
 * Komponen untuk menampilkan riwayat percakapan.
 */
const ConversationHistory: React.FC<{ conversation: ConversationItem[] }> = ({
  conversation,
}) => {
  if (conversation.length === 0) return null;
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Riwayat Percakapan</h2>
      <ul className="space-y-4">
        {conversation.map((item, idx) => (
          <li key={idx} className="p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-500">
              <span className="font-bold text-sky-700">Q{idx + 1}:</span> {item.q}
            </p>
            <p className="mt-2 text-slate-700">
              <span className="font-bold text-amber-600">A{idx + 1}:</span> {item.a}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Komponen untuk menampilkan hasil prediksi AI.
 */
const PredictionResult: React.FC<{ result: ResultType }> = ({ result }) => {
  if (!result) return null;
  const Badge: React.FC<{ children: React.ReactNode; className: string }> = ({ children, className }) => (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${className}`}>
      {children}
    </span>
  );
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Hasil Prediksi AI</h2>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">Status:</span>
          <Badge className="bg-green-100 text-green-800">{result.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">Minat:</span>
          <Badge className="bg-sky-100 text-sky-800">{result.minat}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">Promo:</span>
          <Badge className="bg-amber-100 text-amber-800">{result.promo}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">Estimasi Bayar:</span>
          <Badge className="bg-slate-200 text-slate-800">{result.estimasi_pembayaran}</Badge>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-700 mt-4">Alasan (AI):</h3>
        <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-600 whitespace-pre-wrap leading-relaxed">
          {result.alasan}
        </div>
      </div>
    </div>
  );
};

/**
 * Komponen Spinner untuk indikator loading.
 */
const Spinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

//=========== KOMPONEN UTAMA (HOME) ===========//

export default function Home() {
  const [topic, setTopic] = useState(TOPICS[0].key);
  const [questions, setQuestions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [customerAnswer, setCustomerAnswer] = useState("");
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuestions = () => {
    setLoading(true);
    setQuestions([]); // Kosongkan pertanyaan saat generate baru
    setConversation([]);
    setResult(null);
    setTimeout(() => {
      const topicLabel = TOPICS.find(t => t.key === topic)?.label || "Pilihan";
      setQuestions([
        `Pertanyaan 1 untuk topik ${topicLabel}`,
        `Pertanyaan 2 untuk topik ${topicLabel}`,
        `Pertanyaan 3 untuk topik ${topicLabel}`,
      ]);
      setLoading(false);
    }, 800);
  };

  const handleProcessAnswer = () => {
    setLoading(true);
    setTimeout(() => {
      const newConversation = [ ...conversation, { q: questions[conversation.length], a: customerAnswer }];
      setConversation(newConversation);
      setCustomerAnswer("");
      if (newConversation.length === 3) {
        setResult({
          status: "Aktif",
          minat: "Tinggi",
          promo: "Diskon 10%",
          estimasi_pembayaran: "Rp 250.000",
          alasan: "Pelanggan tertarik dengan promo dan layanan yang ditawarkan setelah diberikan penjelasan yang solutif.",
        });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-700">Simulasi CS AI ICONNET</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Kolom Kiri: Kontrol dan Input */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-6 sticky top-24">
          <div>
            <label htmlFor="topic-select" className="block text-sm font-medium text-slate-600 mb-2">Pilih Topik</label>
            <select
              id="topic-select"
              className="w-full rounded-md border-slate-300 px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
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
            className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleGenerateQuestions}
            disabled={loading && questions.length === 0}
          >
            {loading && questions.length === 0 ? (<><Spinner /> Memproses...</>) : "Generate Pertanyaan"}
          </button>
          
          <QuestionList questions={questions} />
          
          {questions.length > 0 && conversation.length < 3 && (
            <AnswerInput
              question={questions[conversation.length]}
              value={customerAnswer}
              onChange={setCustomerAnswer}
              onSubmit={handleProcessAnswer}
              loading={loading}
            />
          )}
        </div>

        {/* Kolom Kanan: Riwayat dan Hasil */}
        <div className="lg:col-span-2 space-y-8">
          <ConversationHistory conversation={conversation} />
          <PredictionResult result={result} />
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} ICONNET CS AI Simulation
      </footer>
    </div>
  );
}