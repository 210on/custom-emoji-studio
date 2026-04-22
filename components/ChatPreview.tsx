import React, { useEffect, useRef } from 'react';
import { EmojiConfig, Language } from '../types';
import { renderEmojiToCanvas, waitForFonts } from '../utils/emojiCanvas';

interface ChatPreviewProps {
  config: EmojiConfig;
  lang: Language;
}

const slackAvatarColors = ['#611f69', '#1264a3', '#2eb67d', '#ecb22e'];

const ChatPreview: React.FC<ChatPreviewProps> = ({ config, lang }) => {
  const ReactionEmojiCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 256;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = async () => {
        await waitForFonts();
        renderEmojiToCanvas(ctx, size, config);
      };

      draw();
    }, [config]);

    return (
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="h-[18px] w-[18px] object-contain"
        style={{ imageRendering: 'auto' }}
      />
    );
  };

  return (
    <div className="rounded-[1.35rem] border border-slate-200/90 bg-[#f8f8f8] p-0 shadow-sm dark:border-slate-800 dark:bg-[#19171d]">
      <div className="flex items-center justify-between border-b border-slate-200/90 px-4 py-2.5 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#1d1c1d] dark:text-[#f3f3f4]"># emoji-lab</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-400 shadow-sm dark:bg-[#222529] dark:text-slate-500">
              {lang === 'jp' ? 'Slack' : 'Slack'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600">
          <span className="material-symbols-outlined text-[16px]">star</span>
          <span className="material-symbols-outlined text-[16px]">group</span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="group relative rounded-xl px-2 py-2 transition hover:bg-white dark:hover:bg-[#222529]">
          <div className="absolute right-2 top-1 hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-sm group-hover:flex dark:border-slate-700 dark:bg-[#222529] lg:flex">
            <span className="material-symbols-outlined text-[15px] text-slate-400">add_reaction</span>
            <span className="material-symbols-outlined text-[15px] text-slate-400">reply</span>
            <span className="material-symbols-outlined text-[15px] text-slate-400">more_horiz</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${slackAvatarColors[0]}, ${slackAvatarColors[1]})` }}>
              EK
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-black tracking-tight text-[#1d1c1d] dark:text-[#f3f3f4]">
                  {lang === 'jp' ? 'えもじくん' : 'emoji-kun'}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">10:42 AM</span>
              </div>

              <p className="mt-0.5 text-[15px] leading-6 text-[#1d1c1d] dark:text-[#d1d2d3]">
                {lang === 'jp' ? '新しい絵文字を追加しました。' : 'Added a new custom emoji.'}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button className="inline-flex items-center gap-1.5 rounded-full border border-[#87b4f9] bg-[#e8f2ff] px-2.5 py-1 text-xs font-black text-[#1264a3] dark:border-[#3f5e82] dark:bg-[#203041] dark:text-[#76b7ff]">
                  <ReactionEmojiCanvas />
                  <span>2</span>
                </button>

                <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-400 transition hover:text-slate-600 dark:border-slate-700 dark:bg-[#222529] dark:text-slate-500 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
