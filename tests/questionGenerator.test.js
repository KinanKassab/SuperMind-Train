// SuperMind Trainer - Question Generator Tests

import { QuestionGenerator, createQuestionSet, validateQuestion } from '../assets/js/questionGenerator.js';

describe('QuestionGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new QuestionGenerator();
  });

  describe('generateQuestion', () => {
    test('should generate a valid question with correct structure', () => {
      const question = generator.generateQuestion();
      
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('factorA');
      expect(question).toHaveProperty('factorB');
      expect(question).toHaveProperty('correctAnswer');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('difficulty');
      expect(question).toHaveProperty('timestamp');
      expect(question).toHaveProperty('timeLimit');
    });

    test('should generate correct answer for multiplication', () => {
      const question = generator.generateQuestion();
      
      expect(question.correctAnswer).toBe(question.factorA * question.factorB);
    });

    test('should generate exactly 4 answer options', () => {
      const question = generator.generateQuestion();
      
      expect(question.options).toHaveLength(4);
    });

    test('should have exactly one correct answer', () => {
      const question = generator.generateQuestion();
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      
      expect(correctOptions).toHaveLength(1);
    });

    test('should have correct answer value matching correctAnswer property', () => {
      const question = generator.generateQuestion();
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      expect(correctOption.value).toBe(question.correctAnswer);
    });

    test('should respect factor ranges', () => {
      const question = generator.generateQuestion({
        factorARange: [5, 10],
        factorBRange: [20, 30]
      });
      
      expect(question.factorA).toBeGreaterThanOrEqual(5);
      expect(question.factorA).toBeLessThanOrEqual(10);
      expect(question.factorB).toBeGreaterThanOrEqual(20);
      expect(question.factorB).toBeLessThanOrEqual(30);
    });

    test('should avoid duplicates when avoidDuplicates is true', () => {
      generator.clearHistory();
      
      const question1 = generator.generateQuestion({ avoidDuplicates: true });
      const question2 = generator.generateQuestion({ avoidDuplicates: true });
      
      expect(question1.factorA).not.toBe(question2.factorA);
      expect(question1.factorB).not.toBe(question2.factorB);
    });
  });

  describe('generateAnswerOptions', () => {
    test('should generate 3 distractors plus correct answer', () => {
      const correctAnswer = 24;
      const factorA = 6;
      const factorB = 4;
      
      const options = generator.generateAnswerOptions(correctAnswer, factorA, factorB, 'normal');
      
      expect(options).toHaveLength(4);
      expect(options.some(opt => opt.value === correctAnswer)).toBe(true);
    });

    test('should generate reasonable distractors', () => {
      const correctAnswer = 24;
      const factorA = 6;
      const factorB = 4;
      
      const options = generator.generateAnswerOptions(correctAnswer, factorA, factorB, 'normal');
      
      options.forEach(option => {
        expect(option.value).toBeGreaterThanOrEqual(0);
        expect(option.value).toBeLessThan(1000); // Reasonable upper bound
      });
    });
  });

  describe('generateDistractors', () => {
    test('should generate 3 unique distractors', () => {
      const correctAnswer = 24;
      const factorA = 6;
      const factorB = 4;
      
      const distractors = generator.generateDistractors(correctAnswer, factorA, factorB, 'normal');
      
      expect(distractors).toHaveLength(3);
      expect(new Set(distractors).size).toBe(3); // All unique
      expect(distractors).not.toContain(correctAnswer);
    });

    test('should generate different distractors for different difficulties', () => {
      const correctAnswer = 24;
      const factorA = 6;
      const factorB = 4;
      
      const easyDistractors = generator.generateDistractors(correctAnswer, factorA, factorB, 'easy');
      const hardDistractors = generator.generateDistractors(correctAnswer, factorA, factorB, 'hard');
      
      // Should be different (though not guaranteed)
      expect(easyDistractors).not.toEqual(hardDistractors);
    });
  });

  describe('distractor strategies', () => {
    test('off-by-one strategy should generate adjacent values', () => {
      const correctAnswer = 24;
      const distractor = generator.generateOffByOneDistractor(correctAnswer);
      
      expect([correctAnswer - 1, correctAnswer + 1]).toContain(distractor);
    });

    test('swap digits strategy should swap adjacent digits', () => {
      const correctAnswer = 123;
      const distractor = generator.generateSwapDigitsDistractor(correctAnswer);
      
      expect(distractor).not.toBe(correctAnswer);
      expect(distractor.toString()).toHaveLength(correctAnswer.toString().length);
    });

    test('factor variation strategy should use factor variations', () => {
      const factorA = 6;
      const factorB = 4;
      const distractor = generator.generateFactorVariationDistractor(factorA, factorB);
      
      const possibleValues = [
        (factorA + 1) * factorB,
        (factorA - 1) * factorB,
        factorA * (factorB + 1),
        factorA * (factorB - 1)
      ].filter(val => val >= 0);
      
      expect(possibleValues).toContain(distractor);
    });
  });

  describe('generateQuestions', () => {
    test('should generate specified number of questions', () => {
      const questions = generator.generateQuestions(5);
      
      expect(questions).toHaveLength(5);
    });

    test('should generate unique questions', () => {
      const questions = generator.generateQuestions(10);
      const questionPairs = questions.map(q => `${q.factorA}x${q.factorB}`);
      
      expect(new Set(questionPairs).size).toBe(10);
    });
  });

  describe('validation', () => {
    test('should validate correct question structure', () => {
      const question = generator.generateQuestion();
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing question ID', () => {
      const question = generator.generateQuestion();
      delete question.id;
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing question ID');
    });

    test('should detect invalid factor A', () => {
      const question = generator.generateQuestion();
      question.factorA = -1;
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid factor A');
    });

    test('should detect invalid factor B', () => {
      const question = generator.generateQuestion();
      question.factorB = -1;
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid factor B');
    });

    test('should detect wrong number of options', () => {
      const question = generator.generateQuestion();
      question.options = question.options.slice(0, 3);
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid options array');
    });

    test('should detect multiple correct answers', () => {
      const question = generator.generateQuestion();
      question.options[0].isCorrect = true;
      question.options[1].isCorrect = true;
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Must have exactly one correct option');
    });

    test('should detect mismatched correct answer', () => {
      const question = generator.generateQuestion();
      const correctOption = question.options.find(opt => opt.isCorrect);
      correctOption.value = 999;
      
      const validation = generator.validateQuestion(question);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Correct option value does not match correct answer');
    });
  });

  describe('statistics', () => {
    test('should track question statistics', () => {
      generator.clearHistory();
      generator.generateQuestions(5);
      
      const stats = generator.getStatistics();
      
      expect(stats.totalQuestions).toBe(5);
      expect(stats.difficulties).toHaveProperty('normal');
      expect(stats.difficulties.normal).toBe(5);
    });

    test('should calculate factor ranges correctly', () => {
      generator.clearHistory();
      generator.generateQuestion({ factorARange: [5, 10], factorBRange: [20, 30] });
      
      const stats = generator.getStatistics();
      
      expect(stats.factorARange.min).toBeGreaterThanOrEqual(5);
      expect(stats.factorARange.max).toBeLessThanOrEqual(10);
      expect(stats.factorBRange.min).toBeGreaterThanOrEqual(20);
      expect(stats.factorBRange.max).toBeLessThanOrEqual(30);
    });
  });

  describe('export/import', () => {
    test('should export questions to JSON', () => {
      const questions = generator.generateQuestions(3);
      const json = generator.exportQuestions(questions);
      
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(3);
    });

    test('should import questions from JSON', () => {
      const questions = generator.generateQuestions(3);
      const json = generator.exportQuestions(questions);
      
      const imported = generator.importQuestions(json);
      
      expect(imported).toHaveLength(3);
      expect(imported[0]).toHaveProperty('id');
      expect(imported[0]).toHaveProperty('factorA');
    });

    test('should handle invalid JSON gracefully', () => {
      const imported = generator.importQuestions('invalid json');
      
      expect(imported).toEqual([]);
    });
  });

  describe('utility functions', () => {
    test('createQuestionSet should generate questions', () => {
      const questions = createQuestionSet(3);
      
      expect(questions).toHaveLength(3);
      expect(questions[0]).toHaveProperty('id');
    });

    test('validateQuestion should work as standalone function', () => {
      const question = generator.generateQuestion();
      const validation = validateQuestion(question);
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('time limits', () => {
    test('should set appropriate time limits for different difficulties', () => {
      const easyLimit = generator.getTimeLimit('easy');
      const normalLimit = generator.getTimeLimit('normal');
      const hardLimit = generator.getTimeLimit('hard');
      
      expect(easyLimit).toBeGreaterThan(normalLimit);
      expect(normalLimit).toBeGreaterThan(hardLimit);
    });

    test('should default to normal time limit for unknown difficulty', () => {
      const limit = generator.getTimeLimit('unknown');
      const normalLimit = generator.getTimeLimit('normal');
      
      expect(limit).toBe(normalLimit);
    });
  });
});
