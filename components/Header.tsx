
import React from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  lang: Language;
  toggleLang: () => void;
  onExport: () => void;
  onSave: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, lang, toggleLang, onExport, onSave }) => {
  const t = locales[lang];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/88 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all dark:border-slate-800/70 dark:bg-slate-950/88 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 sm:h-12 sm:w-12">
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">auto_awesome</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {t.title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:inline-flex"
          >
            {t.language}
          </button>
          <button
            onClick={onSave}
            aria-label={t.save}
            title={t.saveHint}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:h-11 sm:w-11"
          >
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
          </button>
          <button 
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:h-11 sm:w-11"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button 
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
          >
            <span className="max-[420px]:hidden">{t.export}</span>
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
