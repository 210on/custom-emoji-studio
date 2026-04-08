
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
    <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between shrink-0 z-30 shadow-sm transition-all">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
        </div>
        <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">{t.title}</span>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button 
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 rounded-full text-xs font-black transition-all shadow-md flex items-center gap-1.5"
        >
          <span>{t.export}</span>
          <span className="material-symbols-outlined text-[18px]">download</span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
