import React, { useState } from "react";
import { Zap, Bot, Settings, Sparkles, ChevronDown } from "lucide-react";
import AnimatedCard from "../components/AnimatedCard";
import QuestionList from "../components/QuestionList";
import AnswerInput from "../components/AnswerInput";
import ConversationHistory from "../components/ConversationHistory";
import PredictionResult from "../components/PredictionResult";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  { 
    key: "telecollection", 
    label: "Telecollection", 
    description: "Penagihan & Recovery",
    icon: "💰",
    color: "from-warning to-tertiary"
  },
  { 
    key: "retention", 
    label: "Retention", 
    description: "Pencegahan Churn",
    icon: "🛡️",
    color: "from-primary to-secondary"
  },
  { 
    key: "winback", 
    label: "Winback", 
    description: "Reaktivasi Customer",
    icon: "🎯",
    color: "from-secondary to-primary"
  },
];

const CSSimulation: React.FC = () => {
  const [topic, setTopic] = useState(TOPICS[0].key);
  const [questions, setQuestions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [customerAnswer, setCustomerAnswer] = useState("");
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);

  const selectedTopic = TOPICS.find(t => t.key === topic) || TOPICS[0];

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setConversation([]);
    setResult(null);
    
    try {
      const pertanyaan = [];
      for (let i = 0; i < 3; i++) {
        const resQ = await fetch(`${API_URL}/api/v1/conversation/generate-question/${topic}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id: "demo", context: pertanyaan.join(" ") })
        });
        const dataQ = await resQ.json();
        pertanyaan.push(dataQ.question);
      }
      setQuestions(pertanyaan);
    } catch {
      alert("Gagal mengambil pertanyaan dari server");
    }
    
    setLoading(false);
  };

  const handleProcessAnswer = async () => {
    setLoading(true);
    
    try {
      const currentQuestion = questions[conversation.length];
      const res = await fetch(`${API_URL}/api/v1/conversation/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: "demo",
          topic,
          question: currentQuestion,
          manual_input: customerAnswer,
        })
      });
      
      const data = await res.json();
      const newConversation = [...conversation, { q: currentQuestion, a: customerAnswer }];
      setConversation(newConversation);
      setCustomerAnswer("");
      
      if (newConversation.length === 3 && data.prediction) {
        setResult(data.prediction);
      }
    } catch {
      alert("Gagal memproses jawaban");
    }
    
    setLoading(false);
  };

return (
<div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] text-foreground font-inter">
    {/* Header (Tidak ada perubahan) */}
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-[#18181b]/80 border-b border-border/50">
      <div className="container mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center float">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                ICONNET AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Simulasi Customer Service Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>

    {/* PERUBAHAN UTAMA: Layout menjadi 2 kolom untuk layar besar (lg) */}
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ============================================= */}
        {/* KOLOM KIRI - PANEL KONTROL          */}
        {/* ============================================= */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-28">
          {/* Topic Selection Card */}
          <AnimatedCard className="space-y-4 p-8 rounded-3xl shadow-2xl glass-card bg-[#23272f]/80 border border-[#23272f]">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Pilih Skenario
              </h3>
            </div>
            
            <div className="relative">
              <select
                className="w-full appearance-none bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              >
                {TOPICS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.icon} {t.label} - {t.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Topic Info Card */}
            <div className={`p-6 rounded-2xl bg-gradient-to-r ${selectedTopic.color} bg-opacity-30 border border-primary/30 shadow-lg`}> 
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTopic.icon}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedTopic.label}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTopic.description}</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              className={`btn-primary w-full px-8 py-4 rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-3 text-lg transition-all duration-300 hover:scale-105 active:scale-95 ${loading && questions.length === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
              onClick={handleGenerateQuestions}
              disabled={loading && questions.length === 0}
            >
              {loading && questions.length === 0 ? (
                <LoadingSpinner text="Generating..." />
              ) : (
                <>
                  <Sparkles className="w-6 h-6 animate-bounce" />
                  Generate Pertanyaan AI
                </>
              )}
            </button>
          </AnimatedCard>

          {/* Question List and Answer Input diletakkan di bawah panel kontrol */}
          <QuestionList questions={questions} currentIndex={conversation.length} />
          
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

        {/* ============================================= */}
        {/* KOLOM KANAN - AREA HASIL            */}
        {/* ============================================= */}
        <div className="lg:col-span-3 space-y-8">
          {/* Welcome State (Hanya muncul jika belum ada pertanyaan) */}
          {questions.length === 0 && (
            <AnimatedCard className="text-center space-y-8 py-16 glass-card bg-[#23272f]/80 border border-[#23272f] rounded-3xl shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto float shadow-xl">
                <Zap className="w-12 h-12 text-white animate-bounce" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold gradient-text">
                  Selamat Datang di AI Assistant
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto text-base">
                  Pilih skenario dan klik "Generate Pertanyaan AI" untuk memulai simulasi customer service
                </p>
              </div>
            </AnimatedCard>
          )}

          {/* Conversation History */}
          <ConversationHistory conversation={conversation} />

          {/* Prediction Results */}
          <PredictionResult result={result} />
        </div>
      </div>
    </main>

    {/* Footer (Tidak ada perubahan) */}
    <footer className="border-t border-border/50 bg-[#18181b]/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
           {new Date().getFullYear()} ICONNET • AI-Powered Customer Service
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-medium">Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

}

export default CSSimulation;