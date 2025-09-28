// SuperMind Trainer - Scoring Tests

import { Storage, formatTime, calculatePercentage } from '../assets/js/utils.js';

describe('Scoring System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Score Calculation', () => {
    test('should calculate percentage correctly', () => {
      expect(calculatePercentage(8, 10)).toBe(80);
      expect(calculatePercentage(5, 5)).toBe(100);
      expect(calculatePercentage(0, 10)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    test('should round percentage to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });
  });

  describe('Time Formatting', () => {
    test('should format time correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });

    test('should handle edge cases', () => {
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(3600)).toBe('60:00');
    });
  });

  describe('Storage Operations', () => {
    test('should save and load data correctly', () => {
      const testData = { score: 85, time: 120 };
      
      Storage.save('test', testData);
      const loaded = Storage.load('test');
      
      expect(loaded).toEqual(testData);
    });

    test('should return default value when key does not exist', () => {
      const defaultValue = { default: true };
      const loaded = Storage.load('nonexistent', defaultValue);
      
      expect(loaded).toEqual(defaultValue);
    });

    test('should handle null default value', () => {
      const loaded = Storage.load('nonexistent', null);
      
      expect(loaded).toBeNull();
    });

    test('should remove data correctly', () => {
      Storage.save('test', { data: 'test' });
      Storage.remove('test');
      
      const loaded = Storage.load('test');
      expect(loaded).toBeNull();
    });

    test('should clear all data', () => {
      Storage.save('test1', { data: 'test1' });
      Storage.save('test2', { data: 'test2' });
      Storage.clear();
      
      expect(Storage.load('test1')).toBeNull();
      expect(Storage.load('test2')).toBeNull();
    });
  });

  describe('Training Session Scoring', () => {
    test('should calculate training score correctly', () => {
      const session = {
        correctCount: 8,
        wrongCount: 2,
        totalQuestions: 10
      };
      
      const score = Math.round((session.correctCount / session.totalQuestions) * 100);
      
      expect(score).toBe(80);
    });

    test('should handle perfect score', () => {
      const session = {
        correctCount: 10,
        wrongCount: 0,
        totalQuestions: 10
      };
      
      const score = Math.round((session.correctCount / session.totalQuestions) * 100);
      
      expect(score).toBe(100);
    });

    test('should handle zero score', () => {
      const session = {
        correctCount: 0,
        wrongCount: 10,
        totalQuestions: 10
      };
      
      const score = Math.round((session.correctCount / session.totalQuestions) * 100);
      
      expect(score).toBe(0);
    });
  });

  describe('Exam Session Scoring', () => {
    test('should calculate exam score with skipped questions', () => {
      const session = {
        correctCount: 7,
        wrongCount: 2,
        skippedCount: 1,
        totalQuestions: 10
      };
      
      const score = Math.round((session.correctCount / session.totalQuestions) * 100);
      
      expect(score).toBe(70);
    });

    test('should handle all questions skipped', () => {
      const session = {
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 10,
        totalQuestions: 10
      };
      
      const score = Math.round((session.correctCount / session.totalQuestions) * 100);
      
      expect(score).toBe(0);
    });
  });

  describe('Response Time Calculation', () => {
    test('should calculate average response time correctly', () => {
      const responseTimes = [1000, 2000, 3000, 4000]; // milliseconds
      const average = Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
      
      expect(average).toBe(2500);
    });

    test('should handle empty response times array', () => {
      const responseTimes = [];
      const average = responseTimes.length > 0 ? 
        Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0;
      
      expect(average).toBe(0);
    });

    test('should convert milliseconds to seconds for display', () => {
      const milliseconds = 2500;
      const seconds = Math.floor(milliseconds / 1000);
      
      expect(seconds).toBe(2);
    });
  });

  describe('Leaderboard Scoring', () => {
    test('should sort scores by percentage correctly', () => {
      const scores = [
        { score: 75, playerName: 'Player A' },
        { score: 90, playerName: 'Player B' },
        { score: 60, playerName: 'Player C' }
      ];
      
      const sorted = scores.sort((a, b) => b.score - a.score);
      
      expect(sorted[0].score).toBe(90);
      expect(sorted[1].score).toBe(75);
      expect(sorted[2].score).toBe(60);
    });

    test('should calculate average score correctly', () => {
      const scores = [80, 90, 70, 85];
      const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      
      expect(average).toBe(81);
    });

    test('should find best score correctly', () => {
      const scores = [80, 90, 70, 85];
      const best = Math.max(...scores);
      
      expect(best).toBe(90);
    });
  });

  describe('Achievement Scoring', () => {
    test('should detect perfect score achievement', () => {
      const scores = [80, 90, 100, 85];
      const hasPerfectScore = scores.some(score => score === 100);
      
      expect(hasPerfectScore).toBe(true);
    });

    test('should detect speed achievement', () => {
      const times = [120, 45, 90, 30]; // seconds
      const hasSpeedAchievement = times.some(time => time < 60);
      
      expect(hasSpeedAchievement).toBe(true);
    });

    test('should detect persistence achievement', () => {
      const sessionCount = 12;
      const hasPersistenceAchievement = sessionCount >= 10;
      
      expect(hasPersistenceAchievement).toBe(true);
    });

    test('should detect expert achievement', () => {
      const scores = [85, 90, 95, 88];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const isExpert = average >= 90;
      
      expect(isExpert).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should validate score data structure', () => {
      const validScore = {
        id: 'score_123',
        playerName: 'Test Player',
        score: 85,
        correctCount: 8,
        wrongCount: 2,
        totalQuestions: 10,
        totalTime: 120,
        timestamp: Date.now()
      };
      
      const isValid = validScore.id && 
                     validScore.playerName && 
                     typeof validScore.score === 'number' &&
                     validScore.score >= 0 && 
                     validScore.score <= 100;
      
      expect(isValid).toBe(true);
    });

    test('should detect invalid score data', () => {
      const invalidScore = {
        id: 'score_123',
        playerName: '', // Empty name
        score: 150, // Invalid score > 100
        correctCount: 8,
        wrongCount: 2,
        totalQuestions: 10,
        totalTime: 120,
        timestamp: Date.now()
      };
      
      const isValid = invalidScore.playerName && 
                     typeof invalidScore.score === 'number' &&
                     invalidScore.score >= 0 && 
                     invalidScore.score <= 100;
      
      expect(isValid).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    test('should calculate accuracy rate correctly', () => {
      const correctAnswers = 8;
      const totalAnswers = 10;
      const accuracyRate = Math.round((correctAnswers / totalAnswers) * 100);
      
      expect(accuracyRate).toBe(80);
    });

    test('should calculate completion rate correctly', () => {
      const completedQuestions = 8;
      const totalQuestions = 10;
      const completionRate = Math.round((completedQuestions / totalQuestions) * 100);
      
      expect(completionRate).toBe(80);
    });

    test('should calculate efficiency score', () => {
      const score = 80;
      const timeUsed = 120; // seconds
      const timeLimit = 300; // seconds
      const timeEfficiency = Math.round((timeLimit - timeUsed) / timeLimit * 100);
      const efficiencyScore = Math.round((score + timeEfficiency) / 2);
      
      expect(efficiencyScore).toBeGreaterThan(0);
      expect(efficiencyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle division by zero in percentage calculation', () => {
      const result = calculatePercentage(5, 0);
      
      expect(result).toBe(0);
    });

    test('should handle negative values in percentage calculation', () => {
      const result = calculatePercentage(-5, 10);
      
      expect(result).toBe(0);
    });

    test('should handle invalid time values', () => {
      expect(formatTime(-1)).toBe('00:00');
      expect(formatTime(NaN)).toBe('00:00');
      expect(formatTime(Infinity)).toBe('00:00');
    });
  });
});
