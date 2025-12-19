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
    const topics = Array.from(new Set(results.map(r => r.topic)));
    return topics.reverse().slice(0, 5); 
  },

  getAverageScore: (): number => {
    const results = storageService.getQuizResults();
    if (results.length === 0) return 0;
    const totalPercentage = results.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
    return Math.round((totalPercentage / results.length) * 100);
  },

  getStreak: (): number => {
    const results = storageService.getQuizResults();
    if (results.length === 0) return 0;
    const sortedDates = results
      .map(r => new Date(r.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (Math.floor((today.getTime() - sortedDates[0].getTime()) / (1000 * 3600 * 24)) > 1) return 0;

    for (let i = 0; i < sortedDates.length; i++) {
      streak++;
      if (!sortedDates[i+1]) break;
      if (Math.floor((sortedDates[i].getTime() - sortedDates[i+1].getTime()) / (1000 * 3600 * 24)) !== 1) break;
    }
    return streak;
  },

  getRecommendation: (): string => {
    const results = storageService.getQuizResults();
    // Default for first-time users
    if (results.length === 0) return "Mastering AI Study Tools";
    
    // Otherwise, suggest the last topic studied to reinforce learning
    const lastResult = results[results.length - 1];
    if (lastResult.score / lastResult.total < 0.7) {
      return lastResult.topic; // Suggest retry if score was low
    }
    
    // If they mastered it, suggest something similar or broader
    return `Advanced ${lastResult.topic}`;
  },

  getWeeklyProgress: (): number => {
    const results = storageService.getQuizResults();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyResults = results.filter(r => r.date >= oneWeekAgo);
    if (weeklyResults.length === 0) return 0;
    const avg = weeklyResults.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / weeklyResults.length;
    return Math.round(avg * 100);
  },

  getWeeklyGoalCompletion: (): string => {
    const results = storageService.getQuizResults();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const count = results.filter(r => r.date >= oneWeekAgo).length;
    return `${count}/10`;
  }
};