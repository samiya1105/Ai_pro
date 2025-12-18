import { ChatMessage, Flashcard, QuizQuestion, ConceptMapData, StudySummary } from "../types";

/**
 * PRODUCTION BACKEND URL:
 * This points to your Node.js Express server deployed on GCP Cloud Run.
 */
const BACKEND_URL = "https://aistudybuddy-backend-2035351700.us-central1.run.app/api/query";

async function callBackend(prompt: string): Promise<string> {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Cloud Run Error (${response.status}): ${errorText || 'No response body'}`);
    }

    const data = await response.json();
    
    if (!data || typeof data.answer !== 'string') {
      console.error("Malformed API response:", data);
      throw new Error("Invalid response format: 'answer' property missing.");
    }

    return data.answer;
  } catch (error: any) {
    console.error("Communication Failure:", error);
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Cannot reach the AI service. Please verify the backend URL is correct and the GCP Cloud Run service is active.");
    }
    
    throw error;
  }
}

export const geminiService = {
  async chatWithTutor(history: ChatMessage[], message: string): Promise<string> {
    const context = history
      .map(h => `${h.role.toUpperCase()}: ${h.text}`)
      .join("\n");

    const prompt = `You are an expert personal tutor. Help the student based on the context provided.
    
Context History:
${context}

New Student Query: ${message}`;

    return await callBackend(prompt);
  },

  async generateQuiz(topic: string, difficulty: "easy" | "medium" | "hard" = "medium"): Promise<QuizQuestion[]> {
    const prompt = `Generate a ${difficulty} level MCQ quiz about "${topic}". Return exactly 5 questions in a JSON array inside an object called "questions". Each question must have 'question', 'options' (array of 4), 'correctAnswer' (string matching one option), and 'explanation'. Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanText);
      return json.questions || [];
    } catch (e) {
      console.error("Quiz Parsing Failure:", e, text);
      throw new Error("The AI returned data in an incompatible format. Please try again.");
    }
  },

  async generateFlashcards(topic: string): Promise<Flashcard[]> {
    const prompt = `Create 8 study flashcards for "${topic}". Return a JSON object with a "cards" array containing { "front": "...", "back": "..." } objects. Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanText);
      return json.cards || [];
    } catch (e) {
      console.error("Flashcard Parsing Failure:", e, text);
      throw new Error("Unable to create flashcards. Please try a different topic.");
    }
  },

  async generateSummary(text: string): Promise<StudySummary> {
    const prompt = `Summarize the following study notes concisely. Return a JSON object with "summary" (string) and "keyPoints" (array of strings). Return ONLY valid JSON. CONTENT: ${text}`;
    
    const result = await callBackend(prompt);
    try {
      const cleanText = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanText);

      return {
        originalText: text,
        summary: json.summary || "",
        keyPoints: json.keyPoints || [],
      };
    } catch (e) {
      console.error("Summary Parsing Failure:", e, result);
      throw new Error("Failed to process study notes.");
    }
  },

  async generateConceptMap(topic: string): Promise<ConceptMapData> {
    const prompt = `Create a concept map for "${topic}". Identify 10 key nodes and their relationships. Return as JSON with "nodes" [{ "id": "...", "label": "..." }] and "links" [{ "source": "id1", "target": "id2", "label": "relationship" }]. Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanText);

      return {
        nodes: json.nodes || [],
        links: json.links || [],
      };
    } catch (e) {
      console.error("Concept Map Parsing Failure:", e, text);
      throw new Error("Could not visualize this concept. Try a more specific topic.");
    }
  }
};