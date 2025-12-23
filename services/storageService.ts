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
  },

  getStreak: (): number => {
    const results = storageService.getQuizResults();
    if (results.length === 0) return 0;
    
    // Extract unique dates as strings to ignore time
    const dates = results.map(r => new Date(r.date).toDateString());
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d).getTime());
    
    // Sort dates descending
    uniqueDates.sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestQuizDate = new Date(uniqueDates[0]);
    latestQuizDate.setHours(0, 0, 0, 0);

    // If no quiz today or yesterday, streak is broken (0)
    if (latestQuizDate.getTime() < yesterday.getTime()) {
      return 0;
    }

    let streak = 0;
    let currentDate = latestQuizDate;

    for (const time of uniqueDates) {
      const quizDate = new Date(time);
      quizDate.setHours(0, 0, 0, 0);

      if (quizDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (quizDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  },

  getWeeklyGoalProgress: (): { current: number, target: number } => {
    const results = storageService.getQuizResults();
    const target = 10; // Weekly goal is 10 quizzes
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const currentWeekResults = results.filter(r => r.date >= oneWeekAgo.getTime());
    return {
      current: currentWeekResults.length,
      target
    };
  }
};