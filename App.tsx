
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import PreviewSection from './components/PreviewSection';
import { EmojiConfig, ScoreMetrics, Language, SavedEmoji } from './types';
import { analyzeAccessibility } from './services/geminiService';

// --- APCA & Math Utilities ---

// Convert Hex to sRGB Linear
const hexToLinear = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Simple power curve estimation for gamma correction (approximate for performance)
  return {
    r: Math.pow(r, 2.4),
    g: Math.pow(g, 2.4),
    b: Math.pow(b, 2.4)
  };
};

// Calculate Luminance (Y)
const getLuminance = (rgb: { r: number, g: number, b: number }) => {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
};

// Calculate APCA (Lc)
// Based on simplified APCA logic for UI scoring
const calculateAPCA = (fgHex: string, bgHex: string): number => {
  const txt = getLuminance(hexToLinear(fgHex));
  const bg = getLuminance(hexToLinear(bgHex));

  let contrast = 0;
  
  if (bg > txt) {
    // Dark text on Light background
    // SAPC Basic simplified
    contrast = (Math.pow(bg, 0.56) - Math.pow(txt, 0.57)) * 100;
  } else {
    // Light text on Dark background
    contrast = (Math.pow(bg, 0.65) - Math.pow(txt, 0.62)) * 100;
  }
  
  return Math.abs(contrast);
};

// Calculate Scalability (Geometric)
const calculateScalability = (config: EmojiConfig): number => {
  let score = 100;
  const charCount = (config.textTop.length + config.textBottom.length);
  
  // 1. Character Density Penalty
  // 1-2 chars: Perfect. 3-4: Okay. 5+: Bad.
  if (charCount > 2) score -= (charCount - 2) * 12;

  // 2. Weight Bonus/Penalty
  // At 24px, thin fonts disappear. Bold is better.
  if (config.fontWeight < 400) score -= 20;
  if (config.fontWeight >= 700) score += 5;

  // 3. Stroke "Choking" Penalty
  // If inner stroke is too thick relative to font size (estimated), it chokes legibility.
  if (config.stroke1Enabled && config.stroke1Width > 8 && config.fontWeight > 500) {
    score -= 15;
  }

  // 4. Border Benefit
  // A moderate outer border helps define shape at small sizes.
  if (config.stroke2Enabled && config.stroke2Width >= 2) {
    score += 10;
  } else {
    // No border implies text might blend into random chat backgrounds
    score -= 10; 
  }

  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('jp');
  const [config, setConfig] = useState<EmojiConfig>({
    textTop: 'おき',
    textBottom: 'た!!',
    fontFamily: "'Noto Sans JP', sans-serif",
    fontWeight: 900,
    condense: 100,
    mainColor: '#FFD700', 
    textAlign: 'center',
    stroke1Enabled: true,
    stroke1Color: '#000000',
    stroke1Width: 4,
    stroke2Enabled: true,
    stroke2Color: '#FFFFFF',
    stroke2Width: 16,
    autoSquare: false,
    spacing: 12,
  });

  const [metrics, setMetrics] = useState<ScoreMetrics>({
    legibility: 85,
    contrastRatio: 90, // Now represents Lc value
    scalability: 95,
  });

  const [history, setHistory] = useState<SavedEmoji[]>([]);

  const [aiTip, setAiTip] = useState<string>("Initializing design engine...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const previewRef = useRef<{ exportPng: () => void }>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleConfigChange = (newConfig: Partial<EmojiConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleSave = () => {
    const newSaved: SavedEmoji = {
      ...config,
      id: Date.now().toString(),
      name: `${config.textTop} ${config.textBottom}`,
      createdAt: new Date().toISOString()
    };
    setHistory(prev => [newSaved, ...prev].slice(0, 10)); // Keep last 10
  };

  const performMathAnalysis = useCallback(() => {
    // 1. Scalability (Deterministic)
    const scaleScore = calculateScalability(config);

    // 2. Contrast (APCA)
    // We compare Main Text Color vs The immediate neighbor.
    // If Outer Stroke exists -> Main vs Outer Stroke (This is the critical edge for the text shape).
    // If Inner Stroke exists & No Outer -> Main vs Inner Stroke.
    // If No Strokes -> Main vs White/Black average (worst case simulation).
    let contrastScore = 0;

    if (config.stroke2Enabled && config.stroke2Width > 2) {
      // Logic: The text sits on top of the outer stroke visually or is surrounded by it.
      // Actually, for readability, we usually check FG vs BG.
      // Here, the 'Background' for the text face is effectively the stroke if the stroke is thick.
      // Or, we check Main Color vs Stroke 1 (if enabled)
      if (config.stroke1Enabled && config.stroke1Width > 2) {
         contrastScore = calculateAPCA(config.mainColor, config.stroke1Color);
      } else {
         contrastScore = calculateAPCA(config.mainColor, config.stroke2Color);
      }
    } else if (config.stroke1Enabled && config.stroke1Width > 2) {
      contrastScore = calculateAPCA(config.mainColor, config.stroke1Color);
    } else {
      // No protective strokes. Compare against typical Light/Dark mode backgrounds.
      // Take the lower (safer) score.
      const onWhite = calculateAPCA(config.mainColor, '#FFFFFF');
      const onBlack = calculateAPCA(config.mainColor, '#000000');
      contrastScore = Math.min(onWhite, onBlack);
    }

    setMetrics(prev => ({
      ...prev,
      contrastRatio: Math.round(contrastScore),
      scalability: scaleScore
    }));
  }, [config]);

  // Run math analysis instantly on every change
  useEffect(() => {
    performMathAnalysis();
  }, [performMathAnalysis]);

  const runAiAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAccessibility(
        config.textTop + config.textBottom, 
        config,
        lang
      );
      
      setMetrics(prev => ({
        ...prev,
        legibility: result.score, // AI provides the "Human Perception / Kanji Complexity" score
      }));
      setAiTip(result.tip);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, lang]); 

  // Debounced AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      runAiAnalysis();
    }, 1200);
    return () => clearTimeout(timer);
  }, [config.textTop, config.textBottom, config.mainColor, config.fontFamily, lang, runAiAnalysis]);

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-black transition-colors duration-500 font-display flex items-center justify-center lg:p-8">
      {/* App Container - Centered on Large Screens */}
      <div className="w-full h-screen lg:h-[92vh] lg:max-w-[1600px] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 lg:rounded-[2rem] lg:shadow-2xl lg:ring-1 lg:ring-slate-900/5 dark:lg:ring-white/10">
        <Header 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          lang={lang}
          toggleLang={() => setLang(l => l === 'en' ? 'jp' : 'en')}
          onExport={() => previewRef.current?.exportPng()}
          onSave={handleSave}
        />
        
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <PreviewSection 
            ref={previewRef} 
            config={config} 
            onChange={handleConfigChange} 
            lang={lang}
            history={history}
            onSelectHistory={(saved) => setConfig(saved)}
            metrics={metrics}
            aiTip={aiTip}
            isAnalyzing={isAnalyzing}
            onRefreshAi={runAiAnalysis}
          />
        </div>

        <Toolbar 
          config={config} 
          onChange={handleConfigChange} 
          onRunAiSuggest={() => {}} 
          lang={lang}
        />
      </div>
    </div>
  );
};

export default App;
