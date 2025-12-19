export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  group?: number;
}

export interface ConceptEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ConceptMapData {
  nodes: ConceptNode[];
  links: ConceptEdge[];
}

export interface StudySummary {
  originalText: string;
  summary: string;
  keyPoints: string[];
}

export type AppView = 'dashboard' | 'chat' | 'quiz' | 'flashcards' | 'summary' | 'concept-map';