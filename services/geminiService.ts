
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getInvestmentExplanation = async (
  symbol: string,
  amount: number,
  isRedDay: boolean,
  partitionProgress: number
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain why we are investing ₹${amount} in ${symbol} today. 
                 Context: ${isRedDay ? 'The stock is down today (opportunity)' : 'Normal market day'}. 
                 Partition progress: ${Math.round(partitionProgress * 100)}%.
                 Keep it extremely concise (1 sentence). Start with a positive, calm tone.`,
      config: {
        maxOutputTokens: 60,
        temperature: 0.7,
      }
    });
    return response.text || "Daily deployment maintains your average price efficiently.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Optimizing your position based on current partition logic.";
  }
};
