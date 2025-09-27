/**
 * Unit tests for QuestionGenerator module
 */
import { QuestionGenerator } from '../js/modules/QuestionGenerator.js';

// Test framework (simple implementation)
class TestFramework {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
    
    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message || 'Expected true');
        }
    }
    
    assertFalse(condition, message) {
        if (condition) {
            throw new Error(message || 'Expected false');
        }
    }
    
    run() {
        console.log('Running QuestionGenerator tests...\n');
        
        this.tests.forEach(test => {
            try {
                test.fn();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        });
        
        console.log(`\nTests completed: ${this.passed} passed, ${this.failed} failed`);
    }
}

const test = new TestFramework();
const generator = new QuestionGenerator();

// Test question generation
test.test('should generate question with valid factors', () => {
    const question = generator.generateQuestion(5, 12);
    
    test.assertEqual(question.factorA, 5);
    test.assertEqual(question.factorB, 12);
    test.assertEqual(question.correctAnswer, 60);
    test.assertEqual(question.questionText, '5 × 12 = ?');
    test.assertTrue(question.answers.length === 4);
    test.assertTrue(question.answers.includes(60));
    test.assertTrue(question.correctIndex >= 0 && question.correctIndex < 4);
});

test.test('should generate random factors when not provided', () => {
    const question = generator.generateQuestion();
    
    test.assertTrue(question.factorA >= 0 && question.factorA <= 10);
    test.assertTrue(question.factorB >= 0 && question.factorB <= 99);
    test.assertEqual(question.correctAnswer, question.factorA * question.factorB);
});

test.test('should generate test with specified number of questions', () => {
    const questions = generator.generateTestQuestions(5);
    
    test.assertEqual(questions.length, 5);
    questions.forEach(q => {
        test.assertTrue(q.factorA >= 0 && q.factorA <= 10);
        test.assertTrue(q.factorB >= 0 && q.factorB <= 99);
    });
});

// Test answer validation
test.test('should validate correct answers', () => {
    const question = generator.generateQuestion(3, 7);
    test.assertTrue(generator.validateAnswer(question, 21));
    test.assertFalse(generator.validateAnswer(question, 20));
    test.assertFalse(generator.validateAnswer(question, 22));
});

// Test distractor generation
test.test('should generate unique distractors', () => {
    const question = generator.generateQuestion(4, 5);
    const distractors = question.answers.filter(answer => answer !== question.correctAnswer);
    
    test.assertEqual(distractors.length, 3);
    
    // Check that all distractors are unique
    const uniqueDistractors = new Set(distractors);
    test.assertEqual(uniqueDistractors.size, 3);
});

test.test('should generate reasonable distractors', () => {
    const question = generator.generateQuestion(6, 8);
    const distractors = question.answers.filter(answer => answer !== question.correctAnswer);
    
    // Distractors should be reasonable (not too far from correct answer)
    distractors.forEach(distractor => {
        test.assertTrue(distractor >= 0);
        test.assertTrue(Math.abs(distractor - question.correctAnswer) <= 50);
    });
});

// Test time calculation
test.test('should calculate time spent correctly', () => {
    const question = {
        startTime: Date.now() - 5000 // 5 seconds ago
    };
    
    const timeSpent = generator.calculateTimeSpent(question);
    test.assertTrue(timeSpent >= 4 && timeSpent <= 6);
});

// Test edge cases
test.test('should handle zero factors', () => {
    const question = generator.generateQuestion(0, 5);
    test.assertEqual(question.correctAnswer, 0);
    test.assertTrue(question.answers.includes(0));
});

test.test('should handle single digit factors', () => {
    const question = generator.generateQuestion(1, 1);
    test.assertEqual(question.correctAnswer, 1);
    test.assertTrue(question.answers.includes(1));
});

// Test distractor strategies
test.test('should generate near-miss distractors', () => {
    const nearMiss = generator.generateNearMiss(20);
    test.assertTrue(Math.abs(nearMiss - 20) <= 2);
});

test.test('should generate swapped digits distractors', () => {
    const swapped = generator.generateSwappedDigits(123);
    test.assertTrue(swapped !== 123);
    test.assertTrue(swapped >= 0);
});

test.test('should generate random reasonable distractors', () => {
    const random = generator.generateRandomReasonable(50);
    test.assertTrue(random >= 0);
    test.assertTrue(Math.abs(random - 50) <= 25);
});

// Run tests
test.run();
