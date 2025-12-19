import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Flashcard, QuizQuestion, ConceptMapData, StudySummary } from "../types.ts";

// Initialize GoogleGenAI strictly according to guidelines using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async chatWithTutor(history: ChatMessage[], message: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: "You are an encouraging expert tutor. Explain things simply but thoroughly." }] },
          ...history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
      });
      return response.text || "I'm processing that. Could you clarify your question?";
    } catch (error) {
      console.error("Chat error:", error);
      return "I'm having a quick study break. Please try again in a few seconds!";
    }
  },

  async generateQuiz(topic: string, difficulty: string = "medium"): Promise<QuizQuestion[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a 5-question ${difficulty} MCQ quiz on "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            }
          }
        }
      });
      const data = JSON.parse(response.text || '{"questions":[]}');
      return data.questions || [];
    } catch (e) {
      console.error("Quiz error:", e);
      return [];
    }
  },

  async generateFlashcards(topic: string): Promise<Flashcard[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 8 flashcards for "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            }
          }
        }
      });
      const data = JSON.parse(response.text || '{"cards":[]}');
      return data.cards || [];
    } catch (e) {
      return [];
    }
  },

  async generateSummary(text: string): Promise<StudySummary> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this study content: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "keyPoints"]
          }
        }
      });
      const data = JSON.parse(response.text || '{"summary":"", "keyPoints":[]}');
      return { originalText: text, ...data };
    } catch (e) {
      return { originalText: text, summary: "Summary unavailable.", keyPoints: [] };
    }
  },

  async generateConceptMap(topic: string): Promise<ConceptMapData> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a concept map for "${topic}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING } } } },
              links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, label: { type: Type.STRING } } } }
            }
          }
        }
      });
      return JSON.parse(response.text || '{"nodes":[], "links":[]}');
    } catch (e) {
      return { nodes: [], links: [] };
    }
  }
};