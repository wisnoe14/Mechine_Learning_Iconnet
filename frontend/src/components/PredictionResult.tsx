import React from 'react';
import { Brain, TrendingUp, Gift, CreditCard, Lightbulb } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import StatusBadge from './StatusBadge';

interface ResultType {
  status: string;
  minat: string;
  promo: string;
  estimasi_pembayaran: string;
  alasan: string;
}

interface PredictionResultProps {
  result: ResultType | null;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  if (!result) return null;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' => {
    switch (status.toLowerCase()) {
      case 'tinggi': return 'success';
      case 'sedang': return 'warning';
      default: return 'primary';
    }
  };

  const getMinatVariant = (minat: string): 'success' | 'warning' | 'primary' => {
    switch (minat.toLowerCase()) {
      case 'tinggi': return 'success';
      case 'sedang': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <AnimatedCard className="space-y-6" glow>
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold gradient-text">
          Hasil Prediksi AI
        </h2>
      </div>

      {/* Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-2 card-interactive">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </span>
          </div>
          <StatusBadge variant={getStatusVariant(result.status)}>
            {result.status}
          </StatusBadge>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2 card-interactive">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Minat
            </span>
          </div>
          <StatusBadge variant={getMinatVariant(result.minat)}>
            {result.minat}
          </StatusBadge>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2 card-interactive">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Promo
            </span>
          </div>
          <StatusBadge variant="secondary">
            {result.promo}
          </StatusBadge>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2 card-interactive">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estimasi Bayar
            </span>
          </div>
          <StatusBadge variant="warning">
            {result.estimasi_pembayaran}
          </StatusBadge>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Analisis AI
        </h3>
        <div className="glass-card p-6 rounded-xl">
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {result.alasan}
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default PredictionResult;