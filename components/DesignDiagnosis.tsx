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

const DesignDiagnosis: React.FC<DesignDiagnosisProps> = ({
  metrics,
  tip,
  isAnalyzing,
  onRefresh,
  lang,
}) => {
  const t = locales[lang];

  const getStatusLabel = (score: number) => {
    if (metrics.contrastRatio >= 75 && metrics.scalability >= 82 && score >= 84) return t.excellent;
    if (metrics.contrastRatio >= 60 && metrics.scalability >= 72 && score >= 70) return t.good;
    return t.needsWork;
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.legibility / 100) * circumference;
  const ringColor =
    metrics.contrastRatio >= 75 && metrics.scalability >= 82 && metrics.legibility >= 84
      ? 'text-emerald-500'
      : metrics.contrastRatio >= 60 && metrics.scalability >= 72 && metrics.legibility >= 70
        ? 'text-amber-500'
        : 'text-rose-500';

  return (
    <section className="rounded-[1.7rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/92 lg:min-h-[220px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0 lg:h-24 lg:w-24">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="9" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="9"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-700 ${ringColor}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white lg:text-3xl">{metrics.legibility}</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{getStatusLabel(metrics.legibility)}</div>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2 text-base font-black text-slate-900 dark:text-white lg:text-lg">
              <span>{`Lc ${metrics.contrastRatio}`}</span>
              <span>{`${metrics.scalability}%`}</span>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-400">
                  <span>{t.contrast}</span>
                  <span>{`Lc ${metrics.contrastRatio}`}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ${metrics.contrastRatio >= 75 ? 'bg-emerald-500' : metrics.contrastRatio >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min((metrics.contrastRatio / 90) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-400">
                  <span>{t.scale}</span>
                  <span>{`${metrics.scalability}%`}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ${metrics.scalability >= 82 ? 'bg-emerald-500' : metrics.scalability >= 72 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${metrics.scalability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
          aria-label={t.refresh}
        >
          <span className={`material-symbols-outlined text-[20px] ${isAnalyzing ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>

      {tip && (
        <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300 lg:text-sm">
          {tip}
        </div>
      )}
    </section>
  );
};

export default DesignDiagnosis;
