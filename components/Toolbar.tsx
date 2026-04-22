import React, { useEffect, useRef, useState } from 'react';
import { EmojiConfig, Language } from '../types';
import { locales } from '../locales';

interface ToolbarProps {
  config: EmojiConfig;
  onChange: (newConfig: Partial<EmojiConfig>) => void;
  lang: Language;
  customColorSlots: string[];
  onChangeCustomColorSlots: (next: string[]) => void;
}

type Tab = 'text' | 'font' | 'color' | 'border' | 'size';
type ControlDensity = 'compact' | 'mobile' | 'full';

const tabs: { id: Tab; icon: string }[] = [
  { id: 'text', icon: 'edit' },
  { id: 'font', icon: 'font_download' },
  { id: 'color', icon: 'palette' },
  { id: 'border', icon: 'border_outer' },
  { id: 'size', icon: 'aspect_ratio' },
];

const colorPresets = [
  '#F05E60', '#F38144', '#F39800', '#FFCC00', '#9ACA3C', '#00A760',
  '#00AA90', '#009FB9', '#0078C2', '#5C64B4', '#9B62A8', '#D7548E',
];

const uploadFontOptionValue = '__upload_font__';
const validHexColor = /^#([0-9A-F]{6})$/i;

const sectionClass =
  'rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/70';
const mobileSectionClass =
  'rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70';

const Toolbar: React.FC<ToolbarProps> = ({
  config,
  onChange,
  lang,
  customColorSlots,
  onChangeCustomColorSlots,
}) => {
  const t = locales[lang];
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [customFonts, setCustomFonts] = useState<{ name: string; value: string }[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(true);
  const [mainColorDraft, setMainColorDraft] = useState(config.mainColor.toUpperCase());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customColorInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setMainColorDraft(config.mainColor.toUpperCase());
  }, [config.mainColor]);

  const defaultFonts = [
    { name: lang === 'jp' ? 'ゴシック' : 'Gothic Bold', value: "'Noto Sans JP', sans-serif" },
    { name: lang === 'jp' ? '丸ゴシック' : 'Rounded', value: "'M PLUS Rounded 1c', sans-serif" },
    { name: lang === 'jp' ? '明朝' : 'Mincho', value: "'Shippori Mincho', serif" },
    { name: lang === 'jp' ? '筆文字風' : 'Kaisei', value: "'Kaisei Tokumin', serif" },
    { name: 'Dela Gothic', value: "'Dela Gothic One', cursive" },
  ];

  const allFonts = [...defaultFonts, ...customFonts];

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
      setCustomFonts((prev) => [...prev, { name: fontName, value: newFontValue }]);
      onChange({ fontFamily: newFontValue });
    } catch (error) {
      console.error('Failed to load font:', error);
    } finally {
      event.target.value = '';
    }
  };

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    onValueChange: (next: number) => void,
    step = 1,
    density: ControlDensity = 'full',
  ) => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';

    return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className={`font-bold text-slate-500 dark:text-slate-400 ${isCompact ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'}`}>{label}</span>
        <span className={`font-black text-slate-900 dark:text-white ${isCompact ? 'text-xs' : isMobile ? 'text-base' : 'text-sm'}`}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(parseInt(event.target.value, 10))}
        className={`w-full accent-indigo-600 ${isMobile ? 'mobile-range min-h-8' : ''}`}
      />
    </label>
    );
  };

  const renderMobileTabIcon = (tab: Tab) => {
    if (tab === 'border') {
      return (
        <svg
          viewBox="0 0 10.92 11.46"
          className="h-[22px] w-[22px]"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M6.65,11.46c-.28,0-.5-.15-.6-.41l-.54-1.38c-.31.29-.65.56-1.01.8-.55.37-1.18.57-1.81.57-1.12,0-2.04-.62-2.46-1.66-.15-.4-.23-.82-.23-1.23,0-1.52.94-2.99,2.46-3.88,0-.14,0-.28,0-.42v-.08H.93c-.35,0-.6-.25-.6-.6v-1.5c0-.35.25-.6.6-.6h1.62s0-.04,0-.06l.02-.41c.03-.35.28-.57.62-.57l1.71.04h0c.22,0,.36.1.44.18.08.08.16.23.15.46-.01.12-.02.24-.03.36h4.26c.35,0,.6.25.6.6v1.5c0,.35-.25.6-.6.6h-1.78c.1.03.2.05.29.08,1.62.53,2.7,1.99,2.7,3.64s-1.1,3.61-4.19,3.98c-.03,0-.05,0-.08,0ZM6.76,10.78l-.35.14.35-.13s0,0,0,0ZM6.21,9.39l.51,1.31c2.54-.34,3.44-1.94,3.44-3.23s-.88-2.5-2.19-2.93c-.76-.25-1.97-.36-3.07-.24-.11.01-.22-.03-.3-.1-.08-.08-.12-.18-.12-.3l.04-.56c.01-.2.18-.35.37-.35h4.65v-1.21h-4.51c-.1,0-.2-.04-.27-.12-.07-.07-.11-.17-.1-.28.01-.2.03-.41.05-.62l-1.4-.03c0,.09-.01.18-.02.28l-.02.41c0,.2-.17.36-.38.36h-1.83v1.21h1.77c.1,0,.2.04.28.12.07.08.11.18.1.28-.01.15-.01.28-.01.43,0,.2,0,.41.01.62,0,.15-.07.28-.2.35-1.38.74-2.27,2.05-2.27,3.34,0,.32.06.65.18.96.3.75.94,1.19,1.76,1.19.48,0,.97-.15,1.4-.44,1.53-1.01,2.57-2.63,3.31-3.93.05-.09.14-.16.25-.18.1-.02.21,0,.3.06.47.34.77.9.77,1.47,0,.41-.18,1.75-2.5,2.13ZM7.8,6.71c-.35.59-.76,1.23-1.25,1.84.9-.24,1.41-.7,1.41-1.29,0-.19-.06-.38-.16-.55ZM2.89,9.03c-.31,0-.58-.18-.73-.47-.11-.23-.16-.46-.16-.72,0-.56.25-1.14.71-1.64.1-.11.25-.15.39-.1.14.04.24.17.26.31.09.71.22,1.33.4,1.9.05.16,0,.34-.15.43-.09.06-.13.08-.17.11-.19.13-.38.19-.56.19ZM2.79,7.54c-.02.1-.04.2-.04.3,0,.14.03.27.08.39.05.04.09.04.13.02-.07-.23-.13-.47-.18-.72ZM5,7.37s-.05,0-.07,0c-.14-.03-.25-.13-.29-.27-.1-.35-.16-.78-.17-1.3,0-.19.13-.35.31-.38.29-.05.68-.09,1.1-.04.13.01.24.09.3.21.06.11.05.25-.01.36-.27.45-.57.89-.86,1.28-.07.09-.18.15-.3.15Z"
          />
        </svg>
      );
    }

    const currentTab = tabs.find((item) => item.id === tab);
    return <span className="material-symbols-outlined text-[22px]">{currentTab?.icon}</span>;
  };

  const renderAutoSquareToggle = (density: ControlDensity = 'full') => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';

    return (
    <label className={`inline-flex items-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 ${isCompact ? 'gap-2 px-2.5 py-1.5' : isMobile ? 'gap-2.5 px-3 py-2' : 'gap-2 px-2.5 py-1.5'}`}>
      <span className={`font-black text-slate-900 dark:text-white ${isCompact ? 'text-[11px]' : isMobile ? 'text-sm' : 'text-sm'}`}>{t.autoSquare}</span>
      <input
        type="checkbox"
        checked={config.autoSquare}
        onChange={(event) => onChange({ autoSquare: event.target.checked })}
        className={`${isMobile ? 'h-4.5 w-4.5' : 'h-4 w-4'} rounded border-slate-300 text-indigo-600 focus:ring-indigo-500`}
      />
    </label>
    );
  };

  const updateCustomColorSlot = (index: number, color: string) => {
    const nextSlots = [...customColorSlots];
    nextSlots[index] = color.toUpperCase();
    onChangeCustomColorSlots(nextSlots);
  };

  const handleMainColorDraftChange = (value: string) => {
    const normalized = value.toUpperCase();
    setMainColorDraft(normalized);

    if (validHexColor.test(normalized)) {
      onChange({ mainColor: normalized });
    }
  };

  const renderTextControls = (density: ControlDensity = 'full') => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';

    return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className={`font-bold text-slate-500 dark:text-slate-400 ${isCompact ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'}`}>{t.topText}</span>
        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/20 ${isCompact ? 'px-3 py-2 text-base' : isMobile ? 'px-4 py-3 text-lg' : 'px-4 py-4 text-2xl'}`}
          type="text"
          value={config.textTop}
          onChange={(event) => onChange({ textTop: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={`font-bold text-slate-500 dark:text-slate-400 ${isCompact ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'}`}>{t.bottomText}</span>
        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/20 ${isCompact ? 'px-3 py-2 text-base' : isMobile ? 'px-4 py-3 text-lg' : 'px-4 py-4 text-2xl'}`}
          type="text"
          value={config.textBottom}
          onChange={(event) => onChange({ textBottom: event.target.value })}
        />
      </label>
    </div>
    );
  };

  const renderFontControls = (density: ControlDensity = 'full') => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';

    return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <select
          value={config.fontFamily}
          onChange={(event) => {
            if (event.target.value === uploadFontOptionValue) {
              fileInputRef.current?.click();
              return;
            }

            onChange({ fontFamily: event.target.value });
          }}
          className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/20 ${isCompact ? 'px-3 py-2 text-sm' : isMobile ? 'px-4 py-3 text-base' : 'px-4 py-3 text-base'}`}
        >
          {allFonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
          <option value={uploadFontOptionValue}>{t.loadFont}</option>
        </select>
      </label>

      {renderSlider(t.weight, config.fontWeight, 100, 900, (value) => onChange({ fontWeight: value }), 100, density)}
    </div>
    );
  };

  const renderSizeControls = (density: ControlDensity = 'full') => (
    <div className="flex flex-col gap-2">
      {renderSlider(lang === 'jp' ? '字間' : 'Letter Spacing', config.letterSpacing, -20, 48, (value) => onChange({ letterSpacing: value }), 1, density)}
      {renderSlider(t.spacing, config.spacing, -80, 80, (value) => onChange({ spacing: value }), 1, density)}
      {renderSlider(t.stretch, config.condense, 60, 140, (value) => onChange({ condense: value }), 1, density)}
    </div>
  );

  const renderBorderControls = (
    key: 'stroke1' | 'stroke2',
    label: string,
    enabled: boolean,
    color: string,
    width: number,
    density: ControlDensity = 'full',
  ) => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';

    return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className={`truncate font-black text-slate-900 dark:text-white ${isCompact ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'}`}>{label}</p>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onChange({ [`${key}Enabled`]: event.target.checked } as Partial<EmojiConfig>)}
          className={`${isMobile ? 'h-5.5 w-5.5' : 'h-5 w-5'} rounded border-slate-300 text-indigo-600 focus:ring-indigo-500`}
        />
      </div>

      {isMobile ? (
        <div className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
          <label className="flex items-center">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
              <input
                type="color"
                className="h-full w-full cursor-pointer bg-transparent"
                value={color}
                onChange={(event) => onChange({ [`${key}Color`]: event.target.value } as Partial<EmojiConfig>)}
              />
            </div>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={width}
            onChange={(event) => onChange({ [`${key}Width`]: parseInt(event.target.value, 10) } as Partial<EmojiConfig>)}
            className="mobile-range min-h-8 w-full accent-indigo-600"
          />
          <span className="w-8 text-right text-base font-black text-slate-900 dark:text-white">{width}</span>
        </div>
      ) : (
        <div className={`flex flex-col gap-2 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
          <label className="flex items-center gap-3">
            <div className={`overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700 ${isMobile ? 'h-10 w-10' : 'h-9 w-9'}`}>
              <input
                type="color"
                className="h-full w-full cursor-pointer bg-transparent"
                value={color}
                onChange={(event) => onChange({ [`${key}Color`]: event.target.value } as Partial<EmojiConfig>)}
              />
            </div>
          </label>
          {renderSlider(t.width, width, 0, 30, (value) => onChange({ [`${key}Width`]: value } as Partial<EmojiConfig>), 1, density)}
        </div>
      )}
    </div>
    );
  };

  const renderColorControls = (density: ControlDensity = 'full') => {
    const isCompact = density === 'compact';
    const isMobile = density === 'mobile';
    const dotSize = isCompact ? 'h-[1.55rem] w-[1.55rem]' : isMobile ? 'h-[1.8rem] w-[1.8rem]' : 'h-[1.55rem] w-[1.55rem]';

    return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700 ${isMobile ? 'h-10 w-10' : 'h-9 w-9'}`}>
          <input
            type="color"
            value={config.mainColor}
            onChange={(event) => {
              const nextColor = event.target.value.toUpperCase();
              setMainColorDraft(nextColor);
              onChange({ mainColor: nextColor });
            }}
            className="h-full w-full cursor-pointer bg-transparent"
          />
        </div>
        <input
          type="text"
          inputMode="text"
          maxLength={7}
          value={mainColorDraft}
          onChange={(event) => handleMainColorDraftChange(event.target.value)}
          className={`min-w-0 flex-1 rounded-xl border border-slate-200 bg-white font-black uppercase tracking-[0.08em] text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/20 ${isCompact ? 'px-3 py-2 text-xs' : isMobile ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm'}`}
          aria-label="Main color hex code"
        />
      </div>
      <div className={`grid grid-cols-6 ${isMobile ? 'gap-2' : 'gap-1.5'}`}>
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => onChange({ mainColor: color })}
            className={`${dotSize} rounded-full border-2 transition hover:scale-[1.03] ${
              config.mainColor === color ? 'border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        ))}
        {customColorSlots.map((color, index) => {
          const hasColor = Boolean(color);
          const isActive = hasColor && color === config.mainColor;

          return (
            <button
              key={`custom-color-slot-${index}`}
              type="button"
              onClick={() => {
                if (!hasColor) {
                  updateCustomColorSlot(index, config.mainColor);
                  return;
                }

                if (isActive) {
                  customColorInputRefs.current[index]?.click();
                  return;
                }

                onChange({ mainColor: color });
                setMainColorDraft(color);
              }}
              className={`relative flex ${dotSize} items-center justify-center rounded-full border-2 transition hover:scale-[1.03] ${
                hasColor
                  ? isActive
                    ? 'border-indigo-600 shadow-lg shadow-indigo-500/20'
                    : 'border-transparent'
                  : 'border-dashed border-slate-300 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-900'
              }`}
              style={hasColor ? { backgroundColor: color } : undefined}
              title={hasColor ? color : config.mainColor}
              aria-label={hasColor ? `Custom color slot ${index + 1}` : `Save current color to slot ${index + 1}`}
            >
              {!hasColor && (
                <span className={`material-symbols-outlined text-slate-400 dark:text-slate-500 ${isMobile ? 'text-[16px]' : 'text-[14px]'}`}>add</span>
              )}
              <input
                type="color"
                value={hasColor ? color : config.mainColor}
                ref={(node) => {
                  customColorInputRefs.current[index] = node;
                }}
                onChange={(event) => {
                  const nextColor = event.target.value.toUpperCase();
                  updateCustomColorSlot(index, nextColor);
                  onChange({ mainColor: nextColor });
                  setMainColorDraft(nextColor);
                }}
                className="pointer-events-none absolute inset-0 opacity-0"
                aria-label={`Edit custom color slot ${index + 1}`}
                tabIndex={-1}
              />
            </button>
          );
        })}
      </div>
    </div>
    );
  };

  return (
    <>
      <section className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="px-4 pt-3">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
        </div>

        <div className="border-b border-slate-200/80 px-4 py-2 dark:border-slate-800 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div />
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? t.collapseEditor : t.expandEditor}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <span className={`material-symbols-outlined text-[20px] transition-transform ${isMobileOpen ? '' : 'rotate-180'}`}>
                expand_more
              </span>
            </button>
          </div>
        </div>

        <div className={`${isMobileOpen ? 'block' : 'hidden'}`}>
          <div className="border-b border-slate-200/80 px-2 py-1.5 dark:border-slate-800">
            <div className="grid grid-cols-5 gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex h-12 min-w-0 items-center justify-center rounded-2xl transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  {renderMobileTabIcon(tab.id)}
                  {activeTab === tab.id && <span className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[40vh] overflow-y-auto px-4 py-3 sm:h-[42vh] sm:px-5">
            {activeTab === 'text' && (
              <div className={`${mobileSectionClass} min-h-full`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">1</span>
                    <p className="text-base font-black text-slate-900 dark:text-white">{t.inputLabel}</p>
                  </div>
                  {renderAutoSquareToggle('mobile')}
                </div>
                {renderTextControls('mobile')}
              </div>
            )}

            {activeTab === 'font' && (
              <div className={`${mobileSectionClass} min-h-full`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">2</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">{t.typoLabel}</p>
                </div>
                {renderFontControls('mobile')}
              </div>
            )}

            {activeTab === 'color' && (
              <div className={`${mobileSectionClass} min-h-full`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">3</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">{t.fill}</p>
                </div>
                {renderColorControls('mobile')}
              </div>
            )}

            {activeTab === 'border' && (
              <div className={`${mobileSectionClass} min-h-full`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">4</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">{lang === 'jp' ? '線' : 'Stroke'}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    {renderBorderControls('stroke1', t.stroke1Label, config.stroke1Enabled, config.stroke1Color, config.stroke1Width, 'mobile')}
                  </div>
                  <div>
                    {renderBorderControls('stroke2', t.stroke2Label, config.stroke2Enabled, config.stroke2Color, config.stroke2Width, 'mobile')}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'size' && (
              <div className={`${mobileSectionClass} min-h-full`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">5</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">{t.dimLabel}</p>
                </div>
                {renderSizeControls('mobile')}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:block">
        <div className="p-3">
          <div className="grid gap-2 xl:grid-cols-[1.14fr_0.95fr_1.05fr_1.7fr_0.95fr]">
            <div className={sectionClass}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">1</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{t.inputLabel}</p>
                </div>
                {renderAutoSquareToggle('compact')}
              </div>
              {renderTextControls('compact')}
            </div>

            <div className={sectionClass}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">2</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{t.typoLabel}</p>
              </div>
              {renderFontControls('compact')}
            </div>

            <div className={sectionClass}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">3</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{t.fill}</p>
              </div>
              {renderColorControls()}
            </div>

            <div className={sectionClass}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">4</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{lang === 'jp' ? '線' : 'Stroke'}</p>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                <div>
                  {renderBorderControls('stroke1', t.stroke1Label, config.stroke1Enabled, config.stroke1Color, config.stroke1Width, 'compact')}
                </div>
                <div className="mt-1 h-full w-px self-stretch bg-slate-200 dark:bg-slate-800" />
                <div>
                  {renderBorderControls('stroke2', t.stroke2Label, config.stroke2Enabled, config.stroke2Color, config.stroke2Width, 'compact')}
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">5</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">{t.dimLabel}</p>
              </div>
              {renderSizeControls('compact')}
            </div>
          </div>
        </div>
      </section>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFileLoad}
      />
    </>
  );
};

export default Toolbar;
