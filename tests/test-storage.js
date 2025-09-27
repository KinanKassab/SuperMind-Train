/**
 * Unit tests for Storage module
 */
import { Storage } from '../js/modules/Storage.js';

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
        if (!condition) {
            throw new Error(message || 'Expected false');
        }
    }
    
    run() {
        console.log('Running Storage tests...\n');
        
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
const storage = new Storage();

// Test settings operations
test.test('should save and retrieve settings', () => {
    const settings = {
        questionCount: 15,
        timerMode: 'per-question',
        timerDuration: 30,
        soundEnabled: true,
        language: 'ar'
    };
    
    storage.saveSettings(settings);
    const retrieved = storage.getSettings();
    
    test.assertEqual(retrieved.questionCount, 15);
    test.assertEqual(retrieved.timerMode, 'per-question');
    test.assertEqual(retrieved.timerDuration, 30);
    test.assertTrue(retrieved.soundEnabled);
    test.assertEqual(retrieved.language, 'ar');
});

test.test('should return null for non-existent settings', () => {
    // Clear settings
    localStorage.removeItem(storage.keys.settings);
    
    const settings = storage.getSettings();
    test.assertEqual(settings, null);
});

// Test test results operations
test.test('should save and retrieve test results', () => {
    const results = {
        totalQuestions: 10,
        correctCount: 8,
        incorrectCount: 2,
        scorePercentage: 80,
        totalTime: 300,
        questions: [],
        userAnswers: [],
        settings: {},
        timestamp: new Date().toISOString()
    };
    
    storage.saveTestResults(results);
    const history = storage.getTestHistory();
    
    test.assertEqual(history.length, 1);
    test.assertEqual(history[0].totalQuestions, 10);
    test.assertEqual(history[0].correctCount, 8);
    test.assertEqual(history[0].scorePercentage, 80);
});

test.test('should limit history to 50 entries', () => {
    // Clear history first
    localStorage.removeItem(storage.keys.history);
    
    // Add 55 test results
    for (let i = 0; i < 55; i++) {
        storage.saveTestResults({
            totalQuestions: 10,
            correctCount: 5,
            incorrectCount: 5,
            scorePercentage: 50,
            totalTime: 300,
            questions: [],
            userAnswers: [],
            settings: {},
            timestamp: new Date().toISOString()
        });
    }
    
    const history = storage.getTestHistory();
    test.assertEqual(history.length, 50);
});

// Test statistics operations
test.test('should update statistics correctly', () => {
    // Clear stats first
    localStorage.removeItem(storage.keys.stats);
    
    const results = {
        totalQuestions: 10,
        correctCount: 8,
        incorrectCount: 2,
        scorePercentage: 80,
        totalTime: 300
    };
    
    storage.saveTestResults(results);
    const stats = storage.getStats();
    
    test.assertEqual(stats.totalTests, 1);
    test.assertEqual(stats.totalQuestions, 10);
    test.assertEqual(stats.correctAnswers, 8);
    test.assertEqual(stats.bestScore, 80);
    test.assertEqual(stats.averageScore, 80);
    test.assertEqual(stats.totalTime, 300);
});

test.test('should calculate average score correctly', () => {
    // Clear stats first
    localStorage.removeItem(storage.keys.stats);
    
    // Add first test
    storage.saveTestResults({
        totalQuestions: 10,
        correctCount: 8,
        scorePercentage: 80,
        totalTime: 300
    });
    
    // Add second test
    storage.saveTestResults({
        totalQuestions: 10,
        correctCount: 6,
        scorePercentage: 60,
        totalTime: 400
    });
    
    const stats = storage.getStats();
    test.assertEqual(stats.totalTests, 2);
    test.assertEqual(stats.averageScore, 70); // (80 + 60) / 2
});

// Test leaderboard operations
test.test('should add entry to leaderboard', () => {
    // Clear leaderboard first
    localStorage.removeItem(storage.keys.leaderboard);
    
    storage.addToLeaderboard('أحمد', 90, 300);
    const leaderboard = storage.getLeaderboard();
    
    test.assertEqual(leaderboard.length, 1);
    test.assertEqual(leaderboard[0].name, 'أحمد');
    test.assertEqual(leaderboard[0].score, 90);
    test.assertEqual(leaderboard[0].time, 300);
});

test.test('should sort leaderboard by score and time', () => {
    // Clear leaderboard first
    localStorage.removeItem(storage.keys.leaderboard);
    
    storage.addToLeaderboard('أحمد', 80, 400);
    storage.addToLeaderboard('فاطمة', 90, 300);
    storage.addToLeaderboard('محمد', 90, 200);
    
    const leaderboard = storage.getLeaderboard();
    
    test.assertEqual(leaderboard.length, 3);
    test.assertEqual(leaderboard[0].name, 'محمد'); // Highest score, lowest time
    test.assertEqual(leaderboard[1].name, 'فاطمة'); // Highest score, higher time
    test.assertEqual(leaderboard[2].name, 'أحمد'); // Lower score
});

test.test('should limit leaderboard to 20 entries', () => {
    // Clear leaderboard first
    localStorage.removeItem(storage.keys.leaderboard);
    
    // Add 25 entries
    for (let i = 0; i < 25; i++) {
        storage.addToLeaderboard(`Player${i}`, 50 + i, 300);
    }
    
    const leaderboard = storage.getLeaderboard();
    test.assertEqual(leaderboard.length, 20);
});

// Test theme operations
test.test('should save and retrieve theme', () => {
    storage.setTheme('dark');
    test.assertEqual(storage.getTheme(), 'dark');
    
    storage.setTheme('light');
    test.assertEqual(storage.getTheme(), 'light');
});

// Test data export/import
test.test('should export data as JSON', () => {
    const settings = { questionCount: 10 };
    storage.saveSettings(settings);
    
    const exported = storage.exportData();
    test.assertTrue(exported.includes('"questionCount":10'));
    test.assertTrue(exported.includes('exportDate'));
});

test.test('should import data from JSON', () => {
    const testData = {
        settings: { questionCount: 15 },
        stats: { totalTests: 5 },
        history: [],
        leaderboard: [],
        theme: 'dark'
    };
    
    const jsonData = JSON.stringify(testData);
    const success = storage.importData(jsonData);
    
    test.assertTrue(success);
    test.assertEqual(storage.getSettings().questionCount, 15);
    test.assertEqual(storage.getStats().totalTests, 5);
    test.assertEqual(storage.getTheme(), 'dark');
});

// Test error handling
test.test('should handle invalid JSON gracefully', () => {
    const success = storage.importData('invalid json');
    test.assertFalse(success);
});

test.test('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('Storage full'); };
    
    storage.saveSettings({ questionCount: 10 });
    // Should not throw error
    
    // Restore original method
    localStorage.setItem = originalSetItem;
});

// Test data clearing
test.test('should clear all data', () => {
    storage.saveSettings({ questionCount: 10 });
    storage.setTheme('dark');
    
    storage.clearAllData();
    
    test.assertEqual(storage.getSettings(), null);
    test.assertEqual(storage.getTheme(), 'light');
});

// Run tests
test.run();
