
import React, { useState, useRef, useEffect } from 'react';
import { EmojiConfig, Language, TextAlign } from '../types';
import { locales } from '../locales';

interface ToolbarProps {
  config: EmojiConfig;
  onChange: (newConfig: Partial<EmojiConfig>) => void;
  onRunAiSuggest: () => void;
  lang: Language;
}

type Tab = 'text' | 'font' | 'size' | 'border' | 'color';

const Toolbar: React.FC<ToolbarProps> = ({ config, onChange, onRunAiSuggest, lang }) => {
  const t = locales[lang];
  const [activeTab, setActiveTab] = useState<Tab>('text');
  
  // Font Management
  const [customFonts, setCustomFonts] = useState<{ name: string, value: string }[]>([]);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const defaultFonts = [
    { name: lang === 'jp' ? 'ゴシック' : 'Gothic Bold', value: "'Noto Sans JP', sans-serif" },
    { name: lang === 'jp' ? '丸ゴシック' : 'Rounded', value: "'M PLUS Rounded 1c', sans-serif" },
    { name: lang === 'jp' ? '明朝' : 'Mincho', value: "'Shippori Mincho', serif" },
    { name: lang === 'jp' ? '筆文字風' : 'Kaisei', value: "'Kaisei Tokumin', serif" },
    { name: 'Dela Gothic', value: "'Dela Gothic One', cursive" },
  ];

  const allFonts = [...defaultFonts, ...customFonts];
  const currentFontName = allFonts.find(f => f.value === config.fontFamily)?.name || t.customFont;

  const alignments: { value: TextAlign, icon: string }[] = [
    { value: 'left', icon: 'align_horizontal_left' },
    { value: 'center', icon: 'align_horizontal_center' },
    { value: 'right', icon: 'align_horizontal_right' },
  ];

  const colors = [
    '#F05E60', '#F38144', '#F39800', '#FFCC00', '#9ACA3C', '#00A760', 
    '#00AA90', '#009FB9', '#0078C2', '#5C64B4', '#9B62A8', '#D7548E', 
    '#FFFFFF', '#000000',
  ];

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, ''); 
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      const newFontValue = `'${fontName}', sans-serif`;
      setCustomFonts(prev => [...prev, { name: fontName, value: newFontValue }]);
      onChange({ fontFamily: newFontValue });
    } catch (err) {
      console.error("Failed to load font:", err);
    }
  };

  const tabs: { id: Tab, label: string, icon: string }[] = [
    { id: 'text', label: lang === 'jp' ? 'テキスト' : 'Text', icon: 'edit' },
    { id: 'font', label: lang === 'jp' ? 'フォント' : 'Font', icon: 'font_download' },
    { id: 'size', label: lang === 'jp' ? 'サイズ' : 'Size', icon: 'aspect_ratio' },
    { id: 'border', label: lang === 'jp' ? '縁取り' : 'Border', icon: 'border_outer' },
    { id: 'color', label: lang === 'jp' ? 'カラー' : 'Color', icon: 'palette' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {/* Input Area */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 min-h-[120px] flex items-center justify-center">
        {activeTab === 'text' && (
          <div className="w-full max-w-md flex flex-col gap-3">
            <input 
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-japanese font-black focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              type="text" value={config.textTop} onChange={(e) => onChange({ textTop: e.target.value })}
            />
            <input 
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-japanese font-black focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              type="text" value={config.textBottom} onChange={(e) => onChange({ textBottom: e.target.value })}
            />
          </div>
        )}

        {activeTab === 'font' && (
          <div className="w-full max-w-md flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {allFonts.map(f => (
                <button
                  key={f.value}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${config.fontFamily === f.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                  style={{ fontFamily: f.value }}
                  onClick={() => onChange({ fontFamily: f.value })}
                >
                  {f.name}
                </button>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold border border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                {t.loadFont}
              </button>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {alignments.map((a) => (
                <button
                  key={a.value} onClick={() => onChange({ textAlign: a.value })}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${config.textAlign === a.value ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'size' && (
          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                <span>{t.weight}</span>
                <span>{config.fontWeight}</span>
              </div>
              <input type="range" min="100" max="900" step="100" className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600" value={config.fontWeight} onChange={(e) => onChange({ fontWeight: parseInt(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                <span>{t.spacing}</span>
                <span>{config.spacing}</span>
              </div>
              <input type="range" min="-80" max="80" step="1" className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600" value={config.spacing} onChange={(e) => onChange({ spacing: parseInt(e.target.value) })} />
            </div>
          </div>
        )}

        {activeTab === 'border' && (
          <div className="w-full max-w-md flex flex-col gap-6">
            {[
              { label: t.stroke1Label, enabled: config.stroke1Enabled, key: 'stroke1', color: config.stroke1Color, width: config.stroke1Width },
              { label: t.stroke2Label, enabled: config.stroke2Enabled, key: 'stroke2', color: config.stroke2Color, width: config.stroke2Width },
            ].map(layer => (
              <div key={layer.key} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{layer.label}</span>
                  <input type="checkbox" checked={layer.enabled} onChange={(e) => onChange({ [`${layer.key}Enabled`]: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                </div>
                <div className={`flex items-center gap-4 ${layer.enabled ? '' : 'opacity-30 pointer-events-none'}`}>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <input type="color" className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer" value={layer.color} onChange={(e) => onChange({ [`${layer.key}Color`]: e.target.value })} />
                  </div>
                  <input type="range" min="0" max="48" step="1" className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600" value={layer.width} onChange={(e) => onChange({ [`${layer.key}Width`]: parseInt(e.target.value) })} />
                  <span className="text-[10px] font-black text-slate-500 w-4">{layer.width}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'color' && (
          <div className="w-full max-w-md flex flex-col gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                <input type="color" className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer" value={config.mainColor} onChange={(e) => onChange({ mainColor: e.target.value })} />
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">palette</span>
                </div>
              </div>
              {colors.map(c => (
                <button
                  key={c} onClick={() => onChange({ mainColor: c })}
                  className={`w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110 ${config.mainColor === c ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex border-t border-slate-100 dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-600'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === tab.id ? 'fill-1' : ''}`}>{tab.icon}</span>
            <span className="text-[10px] font-black">{tab.label}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 w-8 h-1 bg-indigo-600 rounded-t-full" />}
          </button>
        ))}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={handleFileLoad} />
    </div>
  );
};

export default Toolbar;
