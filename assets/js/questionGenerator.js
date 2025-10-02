// SuperMind Trainer - Question Generator

import { randomInt, shuffleArray } from './utils.js';

/**
 * Question Generator Class
 * Generates multiplication questions with multiple choice answers
 */
export class QuestionGenerator {
  constructor() {
    this.questionHistory = [];
    this.difficultyLevel = 'normal';
  }

  /**
   * Generate a new multiplication question
   * @param {Object} options - Generation options
   * @returns {Object} Question object
   */
  generateQuestion(options = {}) {
    const {
      factorARange = [0, 10],
      factorBRange = [0, 99],
      avoidDuplicates = true,
      difficulty = 'normal',
      // Optional: choose a specific rule (1, 2, or 4); if omitted, a random rule will be used
      ruleType = null,
      // Optional: enable new multiplication rules (defaults to true). If false, fallback to range-based
      useMultiplicationRules = true
    } = options;

    let question;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      question = this.createQuestion({ factorARange, factorBRange, difficulty, ruleType, useMultiplicationRules });
      attempts++;
    } while (avoidDuplicates && this.isDuplicate(question) && attempts < maxAttempts);

    this.questionHistory.push(question);
    return question;
  }

  /**
   * Create a single question
   * @param {Array} factorARange - Range for factor A [min, max]
   * @param {Array} factorBRange - Range for factor B [min, max]
   * @param {string} difficulty - Difficulty level
   * @returns {Object} Question object
   */
  createQuestion({ factorARange, factorBRange, difficulty, ruleType, useMultiplicationRules }) {
    let factorA;
    let factorB;

    if (useMultiplicationRules) {
      const [a, b] = this.generateFactorsByRules(ruleType, difficulty);
      factorA = a;
      factorB = b;
    } else {
      factorA = randomInt(factorARange[0], factorARange[1]);
      factorB = randomInt(factorBRange[0], factorBRange[1]);
    }
    const correctAnswer = factorA * factorB;

    const question = {
      id: this.generateQuestionId(),
      factorA,
      factorB,
      correctAnswer,
      options: this.generateAnswerOptions(correctAnswer, factorA, factorB, difficulty),
      difficulty,
      timestamp: Date.now(),
      timeLimit: this.getTimeLimit(difficulty)
    };

    return question;
  }

  /**
   * Generate factors using the specified rule or a random rule
   * Rules:
   * 1) n (10..100) × 11
   * 2) a,b (10..100) where at least one has digit 1 in tens or ones place
   * 4) a,b random in 10..100
   * @param {number|null} ruleType - 1, 2, or 4; null for random
   * @returns {[number, number]} factors [a, b]
   */
  generateFactorsByRules(ruleType = null, difficulty = 'medium') {
    const range = this.getRangeForDifficulty(difficulty);
    const validRules = [1, 2, 4];
    // For extreme difficulty, force fully random rule 4 to satisfy "fully random with extremely hard" requirement
    const selectedRule = (difficulty && difficulty.toLowerCase() === 'extreme')
      ? 4
      : (validRules.includes(ruleType) ? ruleType : validRules[randomInt(0, validRules.length - 1)]);
    switch (selectedRule) {
      case 1:
        return this.generateRule1(range);
      case 2:
        return this.generateRule2(range);
      case 4:
      default:
        return this.generateRule4(range);
    }
  }

  /** Rule 1: Single number multiplied by 11 (range × 11) */
  generateRule1(range) {
    const a = randomInt(range.min, range.max);
    const b = 11;
    return [a, b];
  }

  /**
   * Rule 2: Two numbers (10..100) where at least one has digit 1 in tens or ones place
   */
  generateRule2(range) {
    const hasDigit1InTensOrOnes = (n) => {
      const abs = Math.abs(n);
      const ones = abs % 10;
      const tens = Math.floor(abs / 10) % 10;
      return ones === 1 || tens === 1;
    };

    let a = randomInt(range.min, range.max);
    let b = randomInt(range.min, range.max);
    let guard = 0;
    while (!hasDigit1InTensOrOnes(a) && !hasDigit1InTensOrOnes(b) && guard < 1000) {
      // Force one of them to satisfy the condition
      if (Math.random() < 0.5) {
        a = this.randomNumberWithDigit1InTensOrOnes(range);
      } else {
        b = this.randomNumberWithDigit1InTensOrOnes(range);
      }
      guard++;
    }
    return [a, b];
  }

  /** Helper: random number in range with 1 in tens or ones place */
  randomNumberWithDigit1InTensOrOnes(range) {
    // Build list of candidates within range where ones==1 or tens==1
    const candidates = [];
    for (let n = range.min; n <= range.max; n++) {
      const ones = n % 10;
      const tens = Math.floor(n / 10) % 10;
      if (ones === 1 || tens === 1) candidates.push(n);
    }
    // Guard: if no candidates found (shouldn't happen with current ranges), fallback to random in range
    if (candidates.length === 0) {
      return randomInt(range.min, range.max);
    }
    return candidates[randomInt(0, candidates.length - 1)];
  }

  /** Rule 4: Two completely random numbers within difficulty range */
  generateRule4(range) {
    const a = randomInt(range.min, range.max);
    const b = randomInt(range.min, range.max);
    return [a, b];
  }

  /** Map difficulty to factor ranges */
  getRangeForDifficulty(difficulty) {
    const map = {
      easy: { min: 10, max: 20 },
      medium: { min: 10, max: 50 },
      hard: { min: 10, max: 100 },
      // Extreme: keep only two numbers but make each between 50 and 100
      extreme: { min: 50, max: 99 }
    };
    const key = (difficulty || 'medium').toLowerCase();
    return map[key] || map.medium;
  }

  /**
   * Generate multiple choice answer options
   * @param {number} correctAnswer - The correct answer
   * @param {number} factorA - First factor
   * @param {number} factorB - Second factor
   * @param {string} difficulty - Difficulty level
   * @returns {Array} Array of answer options
   */
  generateAnswerOptions(correctAnswer, factorA, factorB, difficulty) {
    const options = [correctAnswer];
    const distractors = this.generateDistractors(correctAnswer, factorA, factorB, difficulty);
    
    options.push(...distractors);
    
    // Shuffle options and return with positions
    const shuffledOptions = shuffleArray(options);
    
    return shuffledOptions.map((value, index) => ({
      value,
      position: index + 1,
      isCorrect: value === correctAnswer
    }));
  }

  /**
   * Generate distractor answers
   * @param {number} correctAnswer - The correct answer
   * @param {number} factorA - First factor
   * @param {number} factorB - Second factor
   * @param {string} difficulty - Difficulty level
   * @returns {Array} Array of distractor values
   */
  generateDistractors(correctAnswer, factorA, factorB, difficulty) {
    const distractors = [];
    const strategies = this.getDistractorStrategies(difficulty);

    // Use different strategies to generate distractors
    strategies.forEach(strategy => {
      try {
        const distractor = this.applyDistractorStrategy(strategy, correctAnswer, factorA, factorB);
        if (Number.isFinite(distractor) && distractor !== correctAnswer && !distractors.includes(distractor) && distractor >= 0) {
          distractors.push(distractor);
        }
      } catch (e) {
        // Skip faulty strategy without breaking generation
      }
    });

    // Fill remaining slots with random values if needed
    while (distractors.length < 3) {
      const randomDistractor = this.generateRandomDistractor(correctAnswer, difficulty);
      if (!distractors.includes(randomDistractor) && randomDistractor !== correctAnswer) {
        distractors.push(randomDistractor);
      }
    }

    return distractors.slice(0, 3);
  }

  /**
   * Get distractor strategies based on difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {Array} Array of strategy names
   */
  getDistractorStrategies(difficulty) {
    const strategies = {
      easy: ['off_by_one', 'swap_digits', 'simple_math'],
      normal: ['off_by_one', 'swap_digits', 'factor_variation', 'simple_math'],
      hard: ['off_by_one', 'swap_digits', 'factor_variation', 'complex_math', 'random_close'],
      // Extreme: emphasize close-but-tricky and factor-based variations
      extreme: ['swap_digits', 'factor_variation', 'complex_math', 'random_close']
    };

    const key = (difficulty || 'medium').toLowerCase();
    const mapKey = key === 'medium' ? 'normal' : key;
    return strategies[mapKey] || strategies.normal;
  }

  /**
   * Apply a specific distractor strategy
   * @param {string} strategy - Strategy name
   * @param {number} correctAnswer - The correct answer
   * @param {number} factorA - First factor
   * @param {number} factorB - Second factor
   * @returns {number} Generated distractor
   */
  applyDistractorStrategy(strategy, correctAnswer, factorA, factorB) {
    switch (strategy) {
      case 'off_by_one':
        return this.generateOffByOneDistractor(correctAnswer);
      
      case 'swap_digits':
        return this.generateSwapDigitsDistractor(correctAnswer);
      
      case 'factor_variation':
        return this.generateFactorVariationDistractor(factorA, factorB);
      
      case 'simple_math':
        return this.generateSimpleMathDistractor(correctAnswer);
      
      case 'complex_math':
        return this.generateComplexMathDistractor(correctAnswer, factorA, factorB);
      
      case 'random_close':
        return this.generateRandomCloseDistractor(correctAnswer);
      
      default:
        return this.generateRandomDistractor(correctAnswer, 'normal');
    }
  }

  /**
   * Generate off-by-one distractor
   * @param {number} correctAnswer - The correct answer
   * @returns {number} Distractor value
   */
  generateOffByOneDistractor(correctAnswer) {
    const variations = [correctAnswer + 1, correctAnswer - 1];
    return variations[randomInt(0, 1)];
  }

  /**
   * Generate swap digits distractor
   * @param {number} correctAnswer - The correct answer
   * @returns {number} Distractor value
   */
  generateSwapDigitsDistractor(correctAnswer) {
    const digits = correctAnswer.toString().split('');
    if (digits.length < 2) {
      return correctAnswer + randomInt(1, 9);
    }
    
    const swapIndex = randomInt(0, digits.length - 2);
    [digits[swapIndex], digits[swapIndex + 1]] = [digits[swapIndex + 1], digits[swapIndex]];
    
    return parseInt(digits.join(''));
  }

  /**
   * Generate factor variation distractor
   * @param {number} factorA - First factor
   * @param {number} factorB - Second factor
   * @returns {number} Distractor value
   */
  generateFactorVariationDistractor(factorA, factorB) {
    const variations = [
      (factorA + 1) * factorB,
      (factorA - 1) * factorB,
      factorA * (factorB + 1),
      factorA * (factorB - 1)
    ].filter(val => val >= 0);
    
    return variations[randomInt(0, variations.length - 1)];
  }

  /**
   * Generate simple math distractor
   * @param {number} correctAnswer - The correct answer
   * @returns {number} Distractor value
   */
  generateSimpleMathDistractor(correctAnswer) {
    const operations = [
      correctAnswer + 10,
      correctAnswer - 10,
      correctAnswer + 5,
      correctAnswer - 5
    ].filter(val => val >= 0);
    
    return operations[randomInt(0, operations.length - 1)];
  }

  /**
   * Generate complex math distractor
   * @param {number} correctAnswer - The correct answer
   * @param {number} factorA - First factor
   * @param {number} factorB - Second factor
   * @returns {number} Distractor value
   */
  generateComplexMathDistractor(correctAnswer, factorA, factorB) {
    const variations = [
      correctAnswer + factorA,
      correctAnswer - factorA,
      correctAnswer + factorB,
      correctAnswer - factorB,
      Math.floor(correctAnswer * 1.1),
      Math.floor(correctAnswer * 0.9)
    ].filter(val => val >= 0);
    
    return variations[randomInt(0, variations.length - 1)];
  }

  /**
   * Generate random close distractor
   * @param {number} correctAnswer - The correct answer
   * @returns {number} Distractor value
   */
  generateRandomCloseDistractor(correctAnswer) {
    const range = Math.max(1, Math.floor(correctAnswer * 0.2));
    const offset = randomInt(-range, range);
    return Math.max(0, correctAnswer + offset);
  }

  /**
   * Generate random distractor
   * @param {number} correctAnswer - The correct answer
   * @param {string} difficulty - Difficulty level
   * @returns {number} Distractor value
   */
  generateRandomDistractor(correctAnswer, difficulty) {
    const ranges = {
      easy: Math.max(10, correctAnswer * 0.5),
      normal: Math.max(20, correctAnswer * 0.8),
      hard: Math.max(50, correctAnswer * 1.5),
      extreme: Math.max(99, correctAnswer * 2.0)
    };
    
    const range = ranges[difficulty] || ranges.normal;
    const offset = randomInt(-range, range);
    return Math.max(0, correctAnswer + offset);
  }

  /**
   * Check if question is duplicate
   * @param {Object} question - Question to check
   * @returns {boolean} True if duplicate
   */
  isDuplicate(question) {
    const a1 = Math.min(question.factorA, question.factorB);
    const b1 = Math.max(question.factorA, question.factorB);
    return this.questionHistory.some(q => {
      const a2 = Math.min(q.factorA, q.factorB);
      const b2 = Math.max(q.factorA, q.factorB);
      return a1 === a2 && b1 === b2;
    });
  }

  /**
   * Generate unique question ID
   * @returns {string} Unique ID
   */
  generateQuestionId() {
    return `q_${Date.now()}_${randomInt(1000, 9999)}`;
  }

  /**
   * Get time limit based on difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {number} Time limit in seconds
   */
  getTimeLimit(difficulty) {
    const limits = {
      easy: 60,
      normal: 45,
      hard: 30,
      extreme: 25
    };
    const key = (difficulty || 'medium').toLowerCase();
    const mapKey = key === 'medium' ? 'normal' : key;
    return limits[mapKey] || limits.normal;
  }

  /**
   * Generate multiple questions
   * @param {number} count - Number of questions to generate
   * @param {Object} options - Generation options
   * @returns {Array} Array of questions
   */
  generateQuestions(count, options = {}) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push(this.generateQuestion(options));
    }
    
    return questions;
  }

  /**
   * Clear question history
   */
  clearHistory() {
    this.questionHistory = [];
  }

  /**
   * Get question statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const total = this.questionHistory.length;
    const difficulties = this.questionHistory.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});

    const factorARange = this.questionHistory.reduce((acc, q) => {
      acc.min = Math.min(acc.min, q.factorA);
      acc.max = Math.max(acc.max, q.factorA);
      return acc;
    }, { min: Infinity, max: -Infinity });

    const factorBRange = this.questionHistory.reduce((acc, q) => {
      acc.min = Math.min(acc.min, q.factorB);
      acc.max = Math.max(acc.max, q.factorB);
      return acc;
    }, { min: Infinity, max: -Infinity });

    return {
      totalQuestions: total,
      difficulties,
      factorARange: total > 0 ? factorARange : { min: 0, max: 0 },
      factorBRange: total > 0 ? factorBRange : { min: 0, max: 0 },
      averageTimeLimit: total > 0 ? 
        this.questionHistory.reduce((sum, q) => sum + q.timeLimit, 0) / total : 0
    };
  }

  /**
   * Validate question object
   * @param {Object} question - Question to validate
   * @returns {Object} Validation result
   */
  validateQuestion(question) {
    const errors = [];
    
    if (!question.id) errors.push('Missing question ID');
    if (typeof question.factorA !== 'number' || question.factorA < 0) {
      errors.push('Invalid factor A');
    }
    if (typeof question.factorB !== 'number' || question.factorB < 0) {
      errors.push('Invalid factor B');
    }
    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0) {
      errors.push('Invalid correct answer');
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push('Invalid options array');
    }
    
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      errors.push('Must have exactly one correct option');
    }
    
    const correctOption = correctOptions[0];
    if (correctOption && correctOption.value !== question.correctAnswer) {
      errors.push('Correct option value does not match correct answer');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export questions to JSON
   * @param {Array} questions - Questions to export
   * @returns {string} JSON string
   */
  exportQuestions(questions) {
    return JSON.stringify(questions, null, 2);
  }

  /**
   * Import questions from JSON
   * @param {string} jsonString - JSON string
   * @returns {Array} Parsed questions
   */
  importQuestions(jsonString) {
    try {
      const questions = JSON.parse(jsonString);
      if (!Array.isArray(questions)) {
        throw new Error('Invalid format: expected array of questions');
      }
      
      // Validate each question
      const validatedQuestions = questions.map((q, index) => {
        const validation = this.validateQuestion(q);
        if (!validation.isValid) {
          console.warn(`Question ${index} validation failed:`, validation.errors);
        }
        return q;
      });
      
      return validatedQuestions;
    } catch (error) {
      console.error('Error importing questions:', error);
      return [];
    }
  }
}

// Create global instance
export const questionGenerator = new QuestionGenerator();

// Export utility functions
export function createQuestionSet(count, options = {}) {
  return questionGenerator.generateQuestions(count, options);
}

export function validateQuestion(question) {
  return questionGenerator.validateQuestion(question);
}

export function getQuestionStatistics() {
  return questionGenerator.getStatistics();
  
}
