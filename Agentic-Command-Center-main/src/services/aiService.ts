import { GoogleGenAI } from "@google/genai";

export class AIService {
  private static instance: AIService;
  
  private constructor() {}

  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(prompt: string, brainId: string, apiKey: string, systemInstruction: string) {
    if (brainId === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Using a stable fast model
        contents: prompt,
        config: {
          systemInstruction,
        }
      });
      return response.text || "No response generated.";
    }
    
    // Mocking other providers for now as they require specific SDKs or fetch calls
    return `[${brainId.toUpperCase()} Response] This feature is being integrated. In a production environment, this would call the ${brainId} API.`;
  }
}

export const aiService = AIService.getInstance();
