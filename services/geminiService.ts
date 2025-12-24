import { ChatMessage, Flashcard, QuizQuestion, ConceptMapData, StudySummary } from "../types";

/**
 * PRODUCTION BACKEND URL:
 * This points to your Node.js Express server deployed on GCP Cloud Run.
 */
const env = (import.meta as any).env || {};
const BASE_URL = env.VITE_API_URL || "https://aistudybuddy-backend-2035351700.us-central1.run.app";

/**
 * Ensure the final endpoint is ALWAYS /api/query
 * This handles cases where VITE_API_URL might be missing the path suffix.
 */
const BACKEND_URL = BASE_URL.includes('/api/query') 
  ? BASE_URL 
  : `${BASE_URL.replace(/\/$/, '')}/api/query`;

/**
 * Robustly extracts JSON from a string by finding the outermost braces.
 * This prevents failures caused by conversational chatter or nested code blocks.
 */
function extractJSON(text: string): any {
  try {
    // Find the first and last structural characters of a JSON object or array
    const start = text.search(/\{|\[/);
    const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

    if (start === -1 || end === -1 || end < start) {
      // If no structural characters found, check if AI is talking instead of coding
      if (text.toLowerCase().includes("i need") || text.toLowerCase().includes("please provide")) {
        throw new Error("The AI needs more information. Please provide more detailed study notes.");
      }
      throw new Error("No JSON structure found in AI response.");
    }

    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (e: any) {
    console.error("JSON Extraction failed head:", text.slice(0, 100));
    // Provide a user-friendly error if the AI returned conversational text instead of data
    if (e instanceof SyntaxError) {
       throw new Error("The AI returned malformed data. Please try clarifying your request or providing more text.");
    }
    throw e;
  }
}

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
      throw new Error("Cannot reach the AI service. Please verify the backend URL is correct.");
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
    const prompt = `Task: Generate a ${difficulty} level MCQ quiz about "${topic}". 
Requirement: Return ONLY a JSON object. No conversational text.
Format: { "questions": [ { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..." } ] }
Questions count: 5. Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    const json = extractJSON(text);
    return json.questions || [];
  },

  async generateFlashcards(topic: string): Promise<Flashcard[]> {
    const prompt = `Task: Create 8 study flashcards for "${topic}".
Requirement: Return ONLY a JSON object. No conversational text.
Format: { "cards": [ { "front": "...", "back": "..." } ] }
Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    const json = extractJSON(text);
    return json.cards || [];
  },

  async generateSummary(text: string): Promise<StudySummary> {
    if (!text || text.trim().length < 20) {
      throw new Error("Please provide more detailed notes for a quality summary.");
    }

    const prompt = `Task: Summarize the following study notes concisely.
Requirement: Return ONLY a JSON object. No conversational text.
Format: { "summary": "A concise paragraph summarizing the core message.", "keyPoints": ["Point 1", "Point 2", "Point 3"] }

Study Notes to Summarize:
${text}`;
    
    const result = await callBackend(prompt);
    const json = extractJSON(result);

    return {
      originalText: text,
      summary: json.summary || "No summary could be generated.",
      keyPoints: json.keyPoints || [],
    };
  },

  async generateConceptMap(topic: string): Promise<ConceptMapData> {a
    const prompt = `Task: Create a concept map for "${topic}". Identify 10 key nodes and their relationships.
Requirement: Return ONLY a JSON object. No conversational text.
Format: { "nodes": [{ "id": "...", "label": "..." }], "links": [{ "source": "id1", "target": "id2", "label": "relationship" }] }
Return ONLY valid JSON.`;
    
    const text = await callBackend(prompt);
    const json = extractJSON(text);

    return {
      nodes: json.nodes || [],
      links: json.links || [],
    };
  }
};