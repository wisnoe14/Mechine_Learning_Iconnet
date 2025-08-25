import React from "react";
import { useNavigate } from "react-router-dom";

interface ResultProps {
  prediction: string;
  conversation: Array<{
    question: string;
    answer: string;
  }>;
  excelUrl?: string;
}

const ResultPage: React.FC<ResultProps> = ({ prediction, conversation, excelUrl }) => {
  const navigate = useNavigate();
  return (
  <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center font-sans overflow-hidden">
  <div className="w-full h-full bg-white rounded-none shadow-2xl p-0 border-none animate-fade-in flex flex-col justify-center items-center sm:p-4 md:p-8 lg:p-12 xl:p-20">
        <div className="flex flex-col items-center mb-8 w-full pt-8 sm:pt-10 md:pt-12">
          <button
            onClick={() => navigate('/Home')}
            className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
            style={{ zIndex: 10 }}
          >
            &larr; Kembali ke Home
          </button>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-2 tracking-tight">Hasil Prediksi Simulasi</h1>
          <p className="text-gray-500 text-center">Berikut adalah hasil analisis percakapan Anda bersama asisten AI.</p>
        </div>
  <div className="mb-8 w-full flex flex-col items-center px-2 sm:px-4 md:px-8 lg:px-16">
          <div className="text-lg font-semibold text-gray-700 mb-2">Prediksi Akhir</div>
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-700 bg-purple-100 rounded-xl px-6 py-3 text-center shadow-lg border border-purple-200 animate-pop-in">
              {prediction}
            </span>
          </div>
        </div>
  <div className="mb-8 w-full flex flex-col items-center px-0 sm:px-0 md:px-0 lg:px-0">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="text-lg font-semibold text-gray-700">Riwayat Percakapan</div>
            {excelUrl && (
              <a
                href={excelUrl}
                download
                className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow transition-all duration-300 flex items-center gap-2"
                style={{ minWidth: 140, textAlign: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                Download Excel
              </a>
            )}
          </div>
          <div className="rounded-xl border border-gray-300 shadow w-full h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] 2xl:h-[85vh] flex flex-col">
            <div className="flex font-bold border-b border-gray-300 bg-gradient-to-r from-blue-100 to-purple-100 w-full">
              <div className="px-2 py-3 text-blue-700 w-12 text-center">No</div>
              <div className="px-2 py-3 text-blue-700 flex-1">Pertanyaan</div>
              <div className="px-2 py-3 text-purple-700 flex-1">Jawaban</div>
            </div>
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
              {conversation.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400">Belum ada percakapan.</div>
              ) : (
                conversation.map((item, idx) => (
                  <div key={idx} className={`flex w-full ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}> 
                    <div className="px-2 py-3 w-12 text-center font-semibold text-gray-500 align-top flex-shrink-0">{idx + 1}</div>
                    <div className="px-2 py-3 align-top break-words whitespace-pre-line flex-1">{item.question}</div>
                    <div className="px-2 py-3 align-top break-words whitespace-pre-line flex-1">{item.answer}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;}}
        .animate-fade-in { animation: fade-in 0.7s ease; }
        @keyframes pop-in { 0% { transform: scale(0.8); opacity: 0.5;} 80% { transform: scale(1.05); opacity: 1;} 100% { transform: scale(1);}}
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(.17,.67,.83,.67); }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default ResultPage;
