import React from 'react';
import { MessageCircle, User, Bot } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

interface ConversationItem {
  q: string;
  a: string;
}

interface ConversationHistoryProps {
  conversation: ConversationItem[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversation }) => {
  if (conversation.length === 0) return null;

  return (
    <AnimatedCard className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-secondary" />
        <h2 className="text-xl font-bold gradient-text">
          Riwayat Percakapan
        </h2>
        <div className="ml-auto bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full">
          {conversation.length}/3
        </div>
      </div>

      <div className="space-y-4">
        {conversation.map((item, idx) => (
          <div
            key={idx}
            className="space-y-3 animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Question */}
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Bot className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-medium text-warning mb-1">
                  AI Agent • Pertanyaan {idx + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {item.q}
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg ml-6">
              <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-medium text-primary mb-1">
                  Customer • Jawaban {idx + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
};

export default ConversationHistory;