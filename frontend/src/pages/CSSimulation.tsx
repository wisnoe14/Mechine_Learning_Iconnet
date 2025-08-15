import { useState, useEffect, useRef } from 'react';
import { 
    Bot, 
    Settings, 
    Sparkles, 
    ChevronDown, 
    CreditCard, 
    ShieldCheck, 
    Target, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    FileDown 
} from 'lucide-react';

// --- Backend Configuration ---
const API_BASE_URL = "https://your-backend-api-endpoint.com/api/v1";

// --- Type Definitions ---
type Topic = "telecollection" | "retention" | "winback";

type ScenarioItem = {
    q: string;
    options: string[];
};

type ConversationItem = {
    q: string;
    a: string;
};

type Prediction = {
    status: string;
    minat: string;
    promo: string;
    estimasi_pembayaran: string;
    alasan: string;
};

type HistoryItem = {
    date: string;
    topic: string;
    result: Prediction;
};

// --- HELPER COMPONENTS ---
const LoadingSpinner = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center gap-2 text-white">
        <Loader2 className="animate-spin h-5 w-5" />
        <span>{text}</span>
    </div>
);

// --- CUSTOM DROPDOWN COMPONENT ---
type DropdownOption = {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

interface CustomDropdownProps {
    options: DropdownOption[];
    selected: string;
    onSelect: (key: string) => void;
    disabled: boolean;
}

const CustomDropdown = ({ options, selected, onSelect, disabled }: CustomDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.key === selected);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full flex items-center justify-between appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
                <span className="font-semibold text-gray-700">{selectedOption?.label || 'Pilih Opsi'}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.key}
                                onClick={() => {
                                    onSelect(option.key);
                                    setIsOpen(false);
                                }}
                                className="px-4 py-3 text-gray-800 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors duration-150"
                            >
                                <option.icon className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">{option.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENTS ---
const ScenarioControls = ({ topic, setTopic, onStart, isGenerating, disabled }: {
    topic: Topic;
    setTopic: (topic: Topic) => void;
    onStart: () => void;
    isGenerating: boolean;
    disabled: boolean;
}) => {
    const TOPICS = [
        { key: "telecollection", label: "Telecollection", description: "Penagihan & Recovery", icon: CreditCard },
        { key: "retention", label: "Retention", description: "Pencegahan Churn", icon: ShieldCheck },
        { key: "winback", label: "Winback", description: "Reaktivasi Customer", icon: Target },
    ];
    const selectedTopic = TOPICS.find(t => t.key === topic);
    const SelectedIcon = selectedTopic?.icon ?? CreditCard;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Pengaturan Skenario</h3>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Topik Simulasi</label>
                <CustomDropdown
                    options={TOPICS}
                    selected={topic}
                    onSelect={(key) => setTopic(key as Topic)}
                    disabled={disabled}
                />
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <SelectedIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{selectedTopic ? selectedTopic.label : ''}</h4>
                        <p className="text-sm text-gray-600">{selectedTopic ? selectedTopic.description : ''}</p>
                    </div>
                </div>
            </div>
            <button
                className="w-full px-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                onClick={onStart}
                disabled={disabled}
            >
                {isGenerating ? <LoadingSpinner text="Membangun Skenario..." /> : <><Sparkles className="w-6 h-6" />Mulai Simulasi</>}
            </button>
        </div>
    );
};

const AnswerInput = ({ question, options, onAnswer, loading }: {
    question: string;
    options: string[];
    onAnswer: (answer: string) => void;
    loading: boolean;
}) => {
    const [manualAnswer, setManualAnswer] = useState("");

    const submitManual = () => {
        if (manualAnswer.trim()) {
            onAnswer(manualAnswer);
            setManualAnswer("");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-200 space-y-5">
            <div>
                <p className="text-sm font-semibold text-blue-700 mb-2">Pertanyaan AI:</p>
                <p className="text-xl font-semibold text-gray-800">{question}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, i) => (
                    <button key={i} onClick={() => onAnswer(opt)} disabled={loading} className="text-left p-4 bg-white hover:bg-blue-50 border border-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50 hover:border-blue-400 hover:shadow-md font-medium text-gray-700">
                        {opt}
                    </button>
                ))}
            </div>
            <div className="relative flex items-center">
                <hr className="w-full border-gray-300" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-white/80 px-2 text-sm text-gray-500 font-medium">ATAU</span>
            </div>
            <div className="space-y-3">
                <textarea
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    rows={3}
                    placeholder="Ketik jawaban manual di sini..."
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                    disabled={loading}
                />
                <button onClick={submitManual} disabled={loading || !manualAnswer.trim()} className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all disabled:bg-gray-400">
                    {loading ? 'Memproses...' : 'Kirim Jawaban Manual'}
                </button>
            </div>
        </div>
    );
};

const PredictionResult = ({ result, topic, onReset }: {
    result: Prediction;
    topic: string;
    onReset: () => void;
}) => {
    const isSuccess = result.status === 'Success';
    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 space-y-6">
            <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Hasil Prediksi AI</h2>
                <p className="text-gray-500">Analisis untuk skenario: <span className="font-semibold">{topic}</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-lg"><strong>Status:</strong> <span className={`font-semibold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>{result.status}</span></div>
                <div className="bg-gray-50 p-4 rounded-lg"><strong>Minat Pelanggan:</strong> <span className="font-semibold text-gray-800">{result.minat}</span></div>
                <div className="bg-gray-50 p-4 rounded-lg"><strong>Estimasi Bayar:</strong> <span className="font-semibold text-gray-800">{result.estimasi_pembayaran}</span></div>
                <div className="bg-gray-50 p-4 rounded-lg"><strong>Rekomendasi Promo:</strong> <span className="font-semibold text-gray-800">{result.promo}</span></div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-1">Ringkasan Alasan:</h4>
                <p className="text-gray-700">{result.alasan}</p>
            </div>
            <button onClick={onReset} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg">Mulai Simulasi Baru</button>
        </div>
    );
};
        
const SimulationHistory = ({ history, onExport }: {
    history: HistoryItem[];
    onExport: () => void;
}) => {
    if (history.length === 0) return null;
    return (
        <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-gray-800">Riwayat Simulasi</h3>
                <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md">
                    <FileDown className="w-4 h-4" />
                    Ekspor ke Excel
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Skenario</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Minat</th>
                            <th className="px-6 py-3">Alasan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{item.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{item.topic}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${item.result.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.result.status}</span></td>
                                <td className="px-6 py-4">{item.result.minat}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{item.result.alasan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- APP COMPONENT ---
const CSSimulation = () => {
    const [topic, setTopic] = useState<Topic>("telecollection");
    const [scenario, setScenario] = useState<ScenarioItem[]>([]);
    const [conversation, setConversation] = useState<ConversationItem[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [result, setResult] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [simulationHistory, setSimulationHistory] = useState<HistoryItem[]>([]);

    const handleStart = async () => {
        setIsGenerating(true);
        setResult(null);
        setConversation([]);
        setCurrentStep(0);
        try {
            const response = await fetch(`${API_BASE_URL}/scenario?topic=${topic}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const scenarioData = await response.json();
            setScenario(scenarioData.scenario || []);
        } catch (error) {
            console.error("Failed to fetch scenario:", error);
            alert("Gagal mengambil skenario dari server. Silakan coba lagi.");
            setScenario([]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswer = async (answer: string) => {
        setLoading(true);
        const newConversation = [...conversation, { q: scenario[currentStep].q, a: answer }];
        setConversation(newConversation);

        if (currentStep + 1 < scenario.length) {
            setCurrentStep(currentStep + 1);
            setLoading(false);
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, conversation: newConversation }),
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const predictionData = await response.json();
                const prediction = predictionData.prediction;
                setResult(prediction);

                const historyItem: HistoryItem = {
                    date: new Date().toLocaleString('id-ID'),
                    topic: topic,
                    result: prediction
                };
                setSimulationHistory(prev => [historyItem, ...prev]);
            } catch (error) {
                console.error("Failed to get prediction:", error);
                alert("Gagal mendapatkan prediksi dari server.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReset = () => {
        setScenario([]);
        setResult(null);
    };

    const handleExport = () => {
        const XLSX = (window as typeof window & { XLSX: typeof import("xlsx") }).XLSX;
        if (!XLSX) {
            alert("Pustaka ekspor Excel tidak ditemukan.");
            return;
        }

        const worksheetData = simulationHistory.map(item => ({
            Tanggal: item.date,
            Skenario: item.topic,
            Status: item.result.status,
            Minat: item.result.minat,
            'Estimasi Bayar': item.result.estimasi_pembayaran,
            Promo: item.result.promo,
            Alasan: item.result.alasan
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Simulasi");
        XLSX.writeFile(workbook, "Riwayat_Simulasi_CS.xlsx");
    };

    const isSimulationRunning = scenario.length > 0 && !result;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ICONNET AI Assistant</h1>
                            <p className="text-sm text-gray-500">Simulasi Customer Service Intelligence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-700 font-medium">Live</span>
                    </div>
                </div>
            </header>
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <aside className="lg:col-span-4 xl:col-span-3">
                        <div className="lg:sticky lg:top-28">
                            <ScenarioControls 
                                topic={topic} 
                                setTopic={setTopic} 
                                onStart={handleStart} 
                                isGenerating={isGenerating}
                                disabled={isSimulationRunning || isGenerating}
                            />
                        </div>
                    </aside>
                    <div className="lg:col-span-8 xl:col-span-9">
                        {!isSimulationRunning && !result && !isGenerating && (
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[50vh]">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/50">
                                    <Bot className="w-10 h-10 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Selamat Datang di AI Assistant</h2>
                                <p className="text-gray-500 mt-2 max-w-md">Pilih skenario dan klik "Mulai Simulasi" untuk memulai.</p>
                            </div>
                        )}
                        {isGenerating && (
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[50vh]">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                <p className="text-gray-600 mt-4">Mempersiapkan skenario AI, mohon tunggu...</p>
                            </div>
                        )}
                        {isSimulationRunning && (
                            <AnswerInput 
                                question={scenario[currentStep].q}
                                options={scenario[currentStep].options}
                                onAnswer={handleAnswer}
                                loading={loading}
                            />
                        )}
                        {result && (
                            <PredictionResult result={result} topic={topic} onReset={handleReset} />
                        )}
                        <SimulationHistory history={simulationHistory} onExport={handleExport} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CSSimulation;
