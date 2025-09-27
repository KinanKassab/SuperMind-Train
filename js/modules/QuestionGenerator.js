/**
 * Question Generator Module
 * Generates multiplication questions with distractors
 */
export class QuestionGenerator {
    constructor() {
        this.distractorStrategies = [
            this.generateNearMiss.bind(this),
            this.generateSwappedDigits.bind(this),
            this.generateRandomReasonable.bind(this)
        ];
    }
    
    /**
     * Generate a single multiplication question
     * @param {number} factorA - First factor (0-10)
     * @param {number} factorB - Second factor (0-99)
     * @returns {Object} Question object with question text and answer options
     */
    generateQuestion(factorA = null, factorB = null) {
        // Generate random factors if not provided
        if (factorA === null) factorA = Math.floor(Math.random() * 11); // 0-10
        if (factorB === null) factorB = Math.floor(Math.random() * 100); // 0-99
        
        const correctAnswer = factorA * factorB;
        const questionText = `${factorA} × ${factorB} = ?`;
        
        // Generate distractors
        const distractors = this.generateDistractors(correctAnswer);
        
        // Create answer options
        const answers = [correctAnswer, ...distractors];
        
        // Shuffle answers
        this.shuffleArray(answers);
        
        // Find correct answer index after shuffling
        const correctIndex = answers.indexOf(correctAnswer);
        
        return {
            questionText,
            factorA,
            factorB,
            correctAnswer,
            answers,
            correctIndex,
            startTime: Date.now()
        };
    }
    
    /**
     * Generate multiple questions for a test
     * @param {number} count - Number of questions to generate
     * @returns {Array} Array of question objects
     */
    generateTestQuestions(count) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            const question = this.generateQuestion();
            questions.push(question);
        }
        
        return questions;
    }
    
    /**
     * Generate distractors for a given correct answer
     * @param {number} correctAnswer - The correct answer
     * @returns {Array} Array of 3 distractor values
     */
    generateDistractors(correctAnswer) {
        const distractors = new Set();
        
        // Use different strategies to generate distractors
        for (const strategy of this.distractorStrategies) {
            const distractor = strategy(correctAnswer);
            if (distractor !== correctAnswer && distractor >= 0) {
                distractors.add(distractor);
            }
        }
        
        // Fill remaining slots with random reasonable values
        while (distractors.size < 3) {
            const randomDistractor = this.generateRandomReasonable(correctAnswer);
            if (randomDistractor !== correctAnswer && randomDistractor >= 0) {
                distractors.add(randomDistractor);
            }
        }
        
        return Array.from(distractors).slice(0, 3);
    }
    
    /**
     * Generate near-miss distractor (±1, ±2)
     * @param {number} correctAnswer - The correct answer
     * @returns {number} Near-miss distractor
     */
    generateNearMiss(correctAnswer) {
        const offset = Math.random() < 0.5 ? 
            (Math.random() < 0.5 ? 1 : 2) : 
            (Math.random() < 0.5 ? -1 : -2);
        return correctAnswer + offset;
    }
    
    /**
     * Generate swapped digits distractor
     * @param {number} correctAnswer - The correct answer
     * @returns {number} Swapped digits distractor
     */
    generateSwappedDigits(correctAnswer) {
        const answerStr = correctAnswer.toString();
        if (answerStr.length < 2) {
            return this.generateRandomReasonable(correctAnswer);
        }
        
        const digits = answerStr.split('');
        const swapIndex = Math.floor(Math.random() * (digits.length - 1));
        
        // Swap adjacent digits
        [digits[swapIndex], digits[swapIndex + 1]] = [digits[swapIndex + 1], digits[swapIndex]];
        
        return parseInt(digits.join(''));
    }
    
    /**
     * Generate random reasonable distractor
     * @param {number} correctAnswer - The correct answer
     * @returns {number} Random reasonable distractor
     */
    generateRandomReasonable(correctAnswer) {
        // Generate a random number within a reasonable range
        const range = Math.max(10, correctAnswer * 0.5);
        const min = Math.max(0, correctAnswer - range);
        const max = correctAnswer + range;
        
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Validate if an answer is correct
     * @param {Object} question - Question object
     * @param {number} userAnswer - User's answer
     * @returns {boolean} True if correct, false otherwise
     */
    validateAnswer(question, userAnswer) {
        return question.correctAnswer === userAnswer;
    }
    
    /**
     * Calculate time spent on a question
     * @param {Object} question - Question object with startTime
     * @returns {number} Time spent in seconds
     */
    calculateTimeSpent(question) {
        if (!question.startTime) return 0;
        return Math.round((Date.now() - question.startTime) / 1000);
    }
}
