
import React, { useImperativeHandle, forwardRef, useState } from 'react';
import { EmojiConfig, Language, SavedEmoji, ScoreMetrics } from '../types';
import { locales } from '../locales';
import ChatPreview from './ChatPreview';
import DesignDiagnosis from './DesignDiagnosis';

interface PreviewSectionProps {
  config: EmojiConfig;
  onChange: (newConfig: Partial<EmojiConfig>) => void;
  lang: Language;
  history: SavedEmoji[];
  onSelectHistory: (config: EmojiConfig) => void;
  metrics: ScoreMetrics;
  aiTip: string;
  isAnalyzing: boolean;
  onRefreshAi: () => void;
}

const PreviewSection = forwardRef<{ exportPng: () => void }, PreviewSectionProps>(({ 
  config, onChange, lang, history, onSelectHistory, metrics, aiTip, isAnalyzing, onRefreshAi 
}, ref) => {
  const t = locales[lang];
  const [lightBg, setLightBg] = useState('#ffffff');
  const [darkBg, setDarkBg] = useState('#020617');
  const [showChatPreview, setShowChatPreview] = useState(false);
  
  const colors = [
    '#F05E60', '#F38144', '#F39800', '#FFCC00', '#9ACA3C', '#00A760', 
    '#00AA90', '#009FB9', '#0078C2', '#5C64B4', '#9B62A8', '#D7548E', 
    '#FFFFFF', '#000000',
  ];

  const exportPng = () => {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    const getMetrics = (text: string) => {
      let scaleX = config.condense / 100;
      if (config.autoSquare) scaleX *= (2 / (text.length || 1));
      return { scaleX };
    };

    const topY = size * 0.35 - (config.spacing * (size / 900));
    const bottomY = size * 0.70 + (config.spacing * (size / 900));

    const drawPart = (text: string, yOffset: number, type: 'fill' | 'stroke1' | 'stroke2') => {
      ctx.save();
      ctx.textBaseline = 'middle';
      const fontSize = 108;
      ctx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}`;
      const { scaleX } = getMetrics(text);
      
      let xPos = size / 2;
      ctx.textAlign = config.textAlign;
      if (config.textAlign === 'left') xPos = size * 0.1;
      if (config.textAlign === 'right') xPos = size * 0.9;

      ctx.translate(xPos, yOffset);
      ctx.scale(scaleX, 1);

      if (type === 'stroke2' && config.stroke2Enabled) {
        ctx.strokeStyle = config.stroke2Color;
        ctx.lineWidth = config.stroke2Width * (size / 166);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeText(text, 0, 0);
      } else if (type === 'stroke1' && config.stroke1Enabled) {
        ctx.strokeStyle = config.stroke1Color;
        ctx.lineWidth = config.stroke1Width * (size / 166);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeText(text, 0, 0);
      } else if (type === 'fill') {
        ctx.fillStyle = config.mainColor;
        ctx.fillText(text, 0, 0);
      }
      ctx.restore();
    };

    ['stroke2', 'stroke1', 'fill'].forEach((t) => {
      drawPart(config.textTop, topY, t as any);
      drawPart(config.textBottom, bottomY, t as any);
    });

    const link = document.createElement('a');
    link.download = `emoji-${config.textTop}${config.textBottom}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useImperativeHandle(ref, () => ({ exportPng }));

  const CanvasEmoji = ({ size = 512 }: { size?: number }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        ctx.clearRect(0, 0, size, size);

        const getMetrics = (text: string) => {
          let scaleX = config.condense / 100;
          if (config.autoSquare) scaleX *= (2 / (text.length || 1));
          return { scaleX };
        };

        const topY = size * 0.35 - (config.spacing * (size / 900));
        const bottomY = size * 0.70 + (config.spacing * (size / 900));

        const drawPart = (text: string, yOffset: number, type: 'fill' | 'stroke1' | 'stroke2') => {
          ctx.save();
          ctx.textBaseline = 'middle';
          const fontSize = size * 0.21;
          ctx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}`;
          const { scaleX } = getMetrics(text);
          
          let xPos = size / 2;
          ctx.textAlign = config.textAlign;
          if (config.textAlign === 'left') xPos = size * 0.1;
          if (config.textAlign === 'right') xPos = size * 0.9;

          ctx.translate(xPos, yOffset);
          ctx.scale(scaleX, 1);

          if (type === 'stroke2' && config.stroke2Enabled) {
            ctx.strokeStyle = config.stroke2Color;
            ctx.lineWidth = config.stroke2Width * (size / 166);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(text, 0, 0);
          } else if (type === 'stroke1' && config.stroke1Enabled) {
            ctx.strokeStyle = config.stroke1Color;
            ctx.lineWidth = config.stroke1Width * (size / 166);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(text, 0, 0);
          } else if (type === 'fill') {
            ctx.fillStyle = config.mainColor;
            ctx.fillText(text, 0, 0);
          }
          ctx.restore();
        };

        ['stroke2', 'stroke1', 'fill'].forEach((t) => {
          drawPart(config.textTop, topY, t as any);
          drawPart(config.textBottom, bottomY, t as any);
        });
      };

      if ('fonts' in document) {
        document.fonts.ready.then(draw);
      } else {
        draw();
      }
      draw(); // Initial draw
    }, [config, size]);

    return (
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="w-full h-full object-contain"
      />
    );
  };

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
      {/* Light Mode Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.lightPreview}</span>
        </div>
        <div className="h-48 flex items-center justify-center p-4" style={{ backgroundColor: lightBg }}>
          <CanvasEmoji />
        </div>
      </div>

      {/* Dark Mode Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.darkPreview}</span>
        </div>
        <div className="h-48 flex items-center justify-center p-4" style={{ backgroundColor: darkBg }}>
          <CanvasEmoji />
        </div>
      </div>

      {/* Design Diagnosis Card */}
      <DesignDiagnosis 
        metrics={metrics} 
        tip={aiTip} 
        isAnalyzing={isAnalyzing} 
        onRefresh={onRefreshAi} 
        lang={lang} 
      />

      {/* Chat Preview Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <button 
          onClick={() => setShowChatPreview(!showChatPreview)}
          className="w-full px-6 py-4 flex items-center justify-between text-sm font-black text-slate-800 dark:text-slate-100"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
            {t.chatPreviewTitle}
          </div>
          <span className={`material-symbols-outlined transition-transform ${showChatPreview ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
        {showChatPreview && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <ChatPreview config={config} lang={lang} />
          </div>
        )}
      </div>

      {/* Style History Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-md border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
        <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">{t.styleHistory}</label>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">{t.noHistory}</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="shrink-0 w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden"
              >
                <div className="flex flex-col items-center leading-none scale-[0.4] font-bold" style={{ color: item.mainColor, fontFamily: item.fontFamily }}>
                  <span>{item.textTop}</span>
                  <span>{item.textBottom}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
});

export default PreviewSection;
