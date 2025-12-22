import { QuizResult } from "../types";

const QUIZ_RESULTS_KEY = 'smart_tutor_quiz_results';

export const storageService = {
  saveQuizResult: (result: QuizResult) => {
    const results = storageService.getQuizResults();
    results.push(result);
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
  },

  getQuizResults: (): QuizResult[] => {
    const data = localStorage.getItem(QUIZ_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getRecentTopics: (): string[] => {
    const results = storageService.getQuizResults();
    // unique topics
    const topics = Array.from(new Set(results.map(r => r.topic)));
    return topics.slice(-5); // Last 5
  },

  getAverageScore: (): number => {
    const results = storageService.getQuizResults();
    if (results.length === 0) return 0;
    const totalPercentage = results.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
    return Math.round((totalPercentage / results.length) * 100);
  }
};
