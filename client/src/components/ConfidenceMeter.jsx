import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConfidenceMeter({ confidence = 0 }) {
  const { t } = useTranslation();

  let tier = 'High';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let barColor = 'bg-emerald-600';
  let Icon = ShieldCheck;
  let explanation = t('result.confidenceHigh', 'AI is highly confident about this prediction.');

  if (confidence < 50) {
    tier = 'Low';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    barColor = 'bg-rose-600';
    Icon = AlertCircle;
    explanation = t('result.confidenceLow', 'Low confidence. Please take a clearer photo or consult an expert.');
  } else if (confidence < 75) {
    tier = 'Medium';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    barColor = 'bg-amber-500';
    Icon = AlertTriangle;
    explanation = t('result.confidenceMedium', 'This result is probable, but verify symptoms carefully.');
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {t('result.confidence', 'AI Confidence')}
        </span>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{tier} ({confidence}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, confidence))}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 mt-2 leading-relaxed flex items-center gap-1">
        <span>{explanation}</span>
      </p>
    </div>
  );
}
