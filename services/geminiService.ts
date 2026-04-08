
import { GoogleGenAI, Type } from "@google/genai";
import { EmojiConfig, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestEmojiDesign(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a Japanese text emoji based on this theme: ${prompt}. Return JSON with top text, bottom text, recommended font weight (100-900), and a hex color code.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            textTop: { type: Type.STRING },
            textBottom: { type: Type.STRING },
            fontWeight: { type: Type.NUMBER },
            color: { type: Type.STRING },
          },
          required: ["textTop", "textBottom", "fontWeight", "color"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.warn("AI Suggestion failed:", error);
    // Return a default fallback if suggestion fails
    return {
      textTop: "Error",
      textBottom: "Limit",
      fontWeight: 700,
      color: "#666666"
    };
  }
}

export async function analyzeAccessibility(
  text: string, 
  config: EmojiConfig,
  lang: Language
) {
  const outputLang = lang === 'jp' ? 'Japanese (日本語)' : 'English';

  const prompt = `Analyze the "Structural Legibility" of this text-based emoji for chat apps:
  - Text Content: "${text}"
  - Font Family: "${config.fontFamily}"
  
  CONTEXT: 
  The app already calculates color contrast (APCA) and pixel scalability mathematically. 
  YOUR JOB is to judge the *Complexity* of the characters (Kanji strokes/shapes) and semantic clarity.

  SCORING RULES (0-100):
  - High Score (90-100): Simple characters (Hiragana, Katakana, simple Kanji), standard fonts, instant readability.
  - Medium Score (70-89): Slightly complex Kanji that might blur at 24px, or stylized fonts.
  - Low Score (<70): Extremely dense Kanji (e.g., 鬱, 薔薇), or confusing character combinations.

  OUTPUT RULES:
  1. Return JSON.
  2. "score": number 0-100.
  3. "tip": A helpful design tip (max 20 words) strictly in ${outputLang}. Focus on the character choice or meaning.
     Example JP: "画数が多い漢字は、ひらがなに直すと読みやすくなります。"
     Example EN: "Complex Kanji may blur at small sizes. Try Hiragana for clarity."`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            tip: { type: Type.STRING },
          },
          required: ["score", "tip"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    // Gracefully handle quota limits or other API errors
    console.warn("AI Analysis unavailable (Quota/Error):", error.message);
    
    return {
      score: 80, // Default safe score
      tip: lang === 'jp' 
        ? "AIアクセス制限中です。数値スコアを参考にしてください。" 
        : "AI limit reached. Please rely on contrast/scale scores."
    };
  }
}
