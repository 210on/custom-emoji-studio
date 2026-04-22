import React, {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { EmojiConfig, Language, SavedEmoji, ScoreMetrics } from '../types';
import { locales } from '../locales';
import ChatPreview from './ChatPreview';
import DesignDiagnosis from './DesignDiagnosis';
import { renderEmojiToCanvas, trimTransparentBounds, waitForFonts } from '../utils/emojiCanvas';

interface PreviewSectionProps {
  config: EmojiConfig;
  lang: Language;
  history: SavedEmoji[];
  previewSurfaces: {
    light: string;
    dark: string;
    customLight: string;
    customDark: string;
  };
  onPreviewSurfacesChange: React.Dispatch<React.SetStateAction<{
    light: string;
    dark: string;
    customLight: string;
    customDark: string;
  }>>;
  onSelectHistory: (config: SavedEmoji) => void;
  metrics: ScoreMetrics;
  aiTip: string;
  isAnalyzing: boolean;
  onRefreshAi: () => void;
}

type WorkspaceTab = 'chat' | 'history';

const previewCards = [
  {
    id: 'light',
    label: 'Light',
    titleKey: 'lightPreview',
    presetColors: ['#FFFFFF', '#F2F3F5', '#F7F1E8', '#EDF4FF'],
    customKey: 'customLight',
  },
  {
    id: 'dark',
    label: 'Dark',
    titleKey: 'darkPreview',
    presetColors: ['#0B1120', '#1F2329', '#2A211B', '#162131'],
    customKey: 'customDark',
  },
] as const;

const getIconColorForBackground = (hex: string) => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.72 ? '#0F172A' : '#FFFFFF';
};

const PreviewCanvas: React.FC<{ config: EmojiConfig; bg: string; size?: number }> = ({
  config,
  bg,
  size = 512,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  }, [config, size]);

  return (
    <div
      className="flex h-[16vh] min-h-[118px] min-w-0 items-center justify-center overflow-hidden rounded-[1.25rem] border border-slate-200/70 p-1.5 shadow-inner dark:border-slate-800 sm:min-h-[190px] lg:h-full lg:min-h-0"
      style={{ backgroundColor: bg }}
    >
      <canvas ref={canvasRef} width={size} height={size} className="h-full w-full min-w-0 object-contain" />
    </div>
  );
};

const PreviewSection = forwardRef<{ exportPng: () => void }, PreviewSectionProps>(({
  config,
  lang,
  history,
  previewSurfaces,
  onPreviewSurfacesChange,
  onSelectHistory,
  metrics,
  aiTip,
  isAnalyzing,
  onRefreshAi,
}, ref) => {
  const t = locales[lang];
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('chat');

  const exportPng = async () => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await waitForFonts();
    renderEmojiToCanvas(ctx, size, config);
    const croppedCanvas = trimTransparentBounds(canvas);

    const link = document.createElement('a');
    link.download = `emoji-${config.textTop}${config.textBottom}.png`;
    link.href = croppedCanvas.toDataURL('image/png');
    link.click();
  };

  const scrollToWorkspace = (nextTab: WorkspaceTab) => {
    const container = workspaceRef.current;
    if (!container) return;

    const index = nextTab === 'chat' ? 0 : 1;
    container.scrollTo({
      left: container.clientWidth * index,
      behavior: 'smooth',
    });
    setWorkspaceTab(nextTab);
  };

  const handleWorkspaceScroll = () => {
    const container = workspaceRef.current;
    if (!container) return;

    const index = Math.round(container.scrollLeft / Math.max(container.clientWidth, 1));
    setWorkspaceTab(index === 0 ? 'chat' : 'history');
  };

  useImperativeHandle(ref, () => ({ exportPng }));

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_minmax(0,1fr)]">
      <section className="min-w-0 rounded-[1.8rem] border border-slate-200/80 bg-white/92 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/92 lg:row-span-2 lg:flex lg:min-h-0 lg:flex-col">
        <div className="grid min-h-0 min-w-0 grid-cols-2 gap-2 lg:flex-1 lg:gap-3">
          {previewCards.map((card) => (
            <div key={card.id} className="flex min-h-0 min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300 lg:px-2.5 lg:text-[10px] lg:tracking-[0.18em]">
                  {card.label}
                </div>
                <div className="flex items-center gap-1">
                  {card.presetColors.map((bg) => {
                    const isSelected = previewSurfaces[card.id] === bg;

                    return (
                      <button
                        key={`${card.id}-${bg}`}
                        type="button"
                        onClick={() => onPreviewSurfacesChange((prev) => ({ ...prev, [card.id]: bg }))}
                        className={`h-5 w-5 rounded-full border-2 transition lg:h-6 lg:w-6 ${
                          isSelected ? 'border-indigo-600 shadow-sm shadow-indigo-500/20' : 'border-white/80 dark:border-slate-900'
                        }`}
                        style={{ backgroundColor: bg }}
                        aria-label={`${t[card.titleKey]} ${bg}`}
                        title={bg}
                      />
                    );
                  })}
                  <label
                    className={`relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 transition lg:h-6 lg:w-6 ${
                      previewSurfaces[card.id] === previewSurfaces[card.customKey]
                        ? 'border-indigo-600 shadow-sm shadow-indigo-500/20'
                        : 'border-white/80 dark:border-slate-900'
                    }`}
                    style={{ backgroundColor: previewSurfaces[card.customKey] }}
                    title={previewSurfaces[card.customKey]}
                  >
                    <span
                      className="material-symbols-outlined text-[10px] lg:text-[11px]"
                      style={{ color: getIconColorForBackground(previewSurfaces[card.customKey]) }}
                    >
                      palette
                    </span>
                    <input
                      type="color"
                      value={previewSurfaces[card.customKey]}
                      onChange={(event) => {
                        const next = event.target.value.toUpperCase();
                        onPreviewSurfacesChange((prev) => ({
                          ...prev,
                          [card.customKey]: next,
                          [card.id]: next,
                        }));
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={`${t[card.titleKey]} custom color`}
                    />
                  </label>
                </div>
              </div>
              <div className="min-h-0 flex-1">
                <PreviewCanvas config={config} bg={previewSurfaces[card.id]} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <DesignDiagnosis
        metrics={metrics}
        tip={aiTip}
        isAnalyzing={isAnalyzing}
        onRefresh={onRefreshAi}
        lang={lang}
      />

      <section className="min-h-0 min-w-0 overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white/92 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/92">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 dark:bg-slate-900">
            {([
              { key: 'chat', label: t.chatTab },
              { key: 'history', label: t.historyTab },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToWorkspace(item.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  workspaceTab === item.key
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={workspaceRef}
          onScroll={handleWorkspaceScroll}
          className="flex h-[110px] snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar lg:h-[150px]"
        >
          <div className="min-w-full snap-center pr-1">
            <ChatPreview config={config} lang={lang} />
          </div>

          <div className="min-w-full snap-center pl-1">
            {history.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-xl font-black text-slate-300 dark:text-slate-700">—</span>
              </div>
            ) : (
              <div className="grid h-full grid-cols-2 gap-2 overflow-hidden">
                {history.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistory(item)}
                    className="min-w-0 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex h-full items-center justify-center rounded-[1rem] bg-white dark:bg-slate-950">
                      <div
                        className="flex min-w-0 flex-col items-center leading-none"
                        style={{ color: item.mainColor, fontFamily: item.fontFamily }}
                      >
                        <span className="truncate text-lg font-black">{item.textTop}</span>
                        <span className="truncate text-lg font-black">{item.textBottom}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
});

export default PreviewSection;
