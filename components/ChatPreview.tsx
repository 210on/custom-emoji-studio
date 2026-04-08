
import React, { useRef, useEffect } from 'react';
import { EmojiConfig, Language } from '../types';
import { locales } from '../locales';

interface ChatPreviewProps {
  config: EmojiConfig;
  lang: Language;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ config, lang }) => {
  // Use a canvas based renderer to match the "Export PNG" output exactly
  const ReactionEmojiCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 256; // Draw at high resolution internally

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
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
            // Fix: Increased multiplier from size/450 to size/166
            ctx.lineWidth = config.stroke2Width * (size / 166);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(text, 0, 0);
          } else if (type === 'stroke1' && config.stroke1Enabled) {
            ctx.strokeStyle = config.stroke1Color;
            // Fix: Increased multiplier from size/450 to size/166
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

        // Draw Sequence
        ['stroke2', 'stroke1', 'fill'].forEach((t) => {
          drawPart(config.textTop, topY, t as any);
          drawPart(config.textBottom, bottomY, t as any);
        });

    }, [config]);

    return (
        <canvas 
            ref={canvasRef} 
            width={size} 
            height={size} 
            className="w-[22px] h-[22px] object-contain"
            style={{ imageRendering: 'auto' }}
        />
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto pl-4 pr-8 py-2 font-display">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm ring-2 ring-white dark:ring-slate-800">
            <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yumi&backgroundColor=c0aede" 
                alt="Avatar" 
                className="w-full h-full object-cover"
            />
        </div>
        
        <div className="flex flex-col items-start min-w-0 flex-1">
          {/* Metadata */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {lang === 'jp' ? 'えもじくん' : 'Mr.Emo'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">11:42</span>
          </div>

          {/* Message Bubble */}
          <div className="relative bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-w-full break-words">
            {lang === 'jp' ? '新しいカスタム絵文字を作りました！' : 'Made NEW Emoji! like it?'}
          </div>

          {/* Reactions Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* The Custom Reaction */}
            <div className="group flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm ring-1 ring-transparent hover:ring-indigo-500/30">
                <ReactionEmojiCanvas />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">2</span>
            </div>

            {/* Add Reaction Button */}
            <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add_reaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
