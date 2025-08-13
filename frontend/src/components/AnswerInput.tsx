import React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
// Simple fallback spinner if LoadingSpinner is missing
const LoadingSpinner = ({ size = "sm", text = "" }) => (
  <span className={`inline-flex items-center gap-2 text-muted-foreground text-${size}`}>
    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
    {text}
  </span>
);

interface AnswerInputProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  question,
  value,
  onChange,
  onSubmit,
  loading
}) => {
  return (
    <AnimatedCard className="space-y-4" glow>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Jawab Pertanyaan
        </h3>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary-foreground font-medium leading-relaxed">
            {question}
          </p>
        </div>

        <div className="relative">
          <textarea
            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground 
                     placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                     focus:ring-primary/50 focus:border-primary/50 transition-all duration-300
                     resize-none min-h-[80px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            placeholder="Ketik jawaban Anda di sini..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && !loading && value.trim()) {
                onSubmit();
              }
            }}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Ctrl+Enter untuk kirim
          </div>
        </div>

        <button
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-sm
            flex items-center justify-center gap-2
            transition-all duration-300 transform
            ${loading || !value.trim()
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'btn-primary hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
          onClick={onSubmit}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <LoadingSpinner size="sm" text="Memproses..." />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Jawaban
            </>
          )}
        </button>
      </div>
    </AnimatedCard>
  );
};

export default AnswerInput;