import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

interface QuestionListProps {
  questions: string[];
  currentIndex: number;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, currentIndex }) => {
  if (questions.length === 0) return null;

  return (
    <AnimatedCard className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <h3 className="text-lg font-semibold gradient-text">
          Daftar Pertanyaan
        </h3>
      </div>
      
      <div className="space-y-3">
        {questions.map((question, idx) => (
          <div
            key={idx}
            className={`
              flex items-start gap-3 p-3 rounded-lg transition-all duration-500
              ${idx < currentIndex 
                ? 'bg-success/10 border border-success/20' 
                : idx === currentIndex 
                ? 'bg-primary/10 border border-primary/20 pulse-glow' 
                : 'bg-muted/30 border border-border/50'
              }
            `}
          >
            {idx < currentIndex ? (
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                idx === currentIndex ? 'text-primary animate-pulse' : 'text-muted-foreground'
              }`} />
            )}
            <span className={`text-sm leading-relaxed ${
              idx < currentIndex 
                ? 'text-success-foreground' 
                : idx === currentIndex 
                ? 'text-primary-foreground font-medium' 
                : 'text-muted-foreground'
            }`}>
              {question}
            </span>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
};

export default QuestionList;