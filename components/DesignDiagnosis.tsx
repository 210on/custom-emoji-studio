
import React from 'react';
import { ScoreMetrics, Language } from '../types';
import { locales } from '../locales';

interface DesignDiagnosisProps {
  metrics: ScoreMetrics;
  tip: string;
  isAnalyzing: boolean;
  onRefresh: () => void;
  lang: Language;
}

const DesignDiagnosis: React.FC<DesignDiagnosisProps> = ({ metrics, tip, isAnalyzing, onRefresh, lang }) => {
  const t = locales[lang];
  
  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10';
    if (score >= 70) return 'text-amber-600 bg-amber-100 dark:text-amber-500 dark:bg-amber-500/10';
    return 'text-rose-600 bg-rose-100 dark:text-rose-500 dark:bg-rose-500/10';
  };

  const getStatusLabel = (score: number) => {
    if (score >= 90) return t.excellent;
    if (score >= 70) return t.good;
    return t.needsWork;
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.legibility / 100) * circumference;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-md border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">{t.accessibility}</h2>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(metrics.legibility)}`}>
          {getStatusLabel(metrics.legibility)}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
            <circle 
              cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${metrics.legibility >= 90 ? 'text-emerald-500' : metrics.legibility >= 70 ? 'text-amber-500' : 'text-rose-500'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{metrics.legibility}</span>
            <span className="text-[8px] font-black text-slate-500 uppercase">Score</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.contrast}</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">Lc {metrics.contrastRatio}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${metrics.contrastRatio > 75 ? 'bg-emerald-500' : metrics.contrastRatio > 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min((metrics.contrastRatio / 90) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.scale}</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{metrics.scalability}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${metrics.scalability > 80 ? 'bg-indigo-500' : metrics.scalability > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${metrics.scalability}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {tip && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex gap-3">
          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px] shrink-0">lightbulb</span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
            {tip}
          </p>
        </div>
      )}
    </div>
  );
};

export default DesignDiagnosis;
