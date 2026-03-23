
import { GoogleGenAI, Type } from "@google/genai";
import { ClientData } from "../types";

export const analyzeIntakeData = async (data: ClientData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a senior business and tax strategist for All Lines Business Solutions. 
    Review the following client intake data and provide a concise summary for an accounting or AI assistant.
    
    Data includes both Tax/Accounting details and AI Automation (AIIO) requirements if applicable.
    
    Highlight:
    1. Core solutions needed (Tax vs AI vs Both).
    2. Missing information or potential roadblocks based on their current tech stack and requirements.
    3. Estimated complexity (Low, Medium, High).
    4. A recommended priority onboarding checklist for the assistant.
    5. For AI services: comment on the feasibility of their #1 automation goal based on their software stack.

    Client Intake Data:
    ${JSON.stringify(data, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Could not generate AI summary at this time.";
  }
};
