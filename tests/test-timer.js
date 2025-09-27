/**
 * Unit tests for Timer module
 */
import { Timer } from '../js/modules/Timer.js';

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
        console.log('Running Timer tests...\n');
        
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

// Test timer initialization
test.test('should initialize with correct default values', () => {
    const timer = new Timer();
    
    test.assertFalse(timer.isRunning);
    test.assertEqual(timer.duration, 0);
    test.assertEqual(timer.getRemainingTime(), 0);
    test.assertEqual(timer.getElapsedTime(), 0);
});

// Test timer start/stop
test.test('should start and stop timer correctly', () => {
    const timer = new Timer();
    
    test.assertFalse(timer.isRunning);
    
    timer.start(10);
    test.assertTrue(timer.isRunning);
    test.assertEqual(timer.duration, 10);
    
    timer.stop();
    test.assertFalse(timer.isRunning);
});

// Test timer reset
test.test('should reset timer correctly', () => {
    const timer = new Timer();
    
    timer.start(10);
    timer.reset();
    
    test.assertFalse(timer.isRunning);
    test.assertEqual(timer.duration, 0);
    test.assertEqual(timer.getRemainingTime(), 0);
});

// Test remaining time calculation
test.test('should calculate remaining time correctly', () => {
    const timer = new Timer();
    
    timer.start(10);
    test.assertTrue(timer.getRemainingTime() <= 10);
    test.assertTrue(timer.getRemainingTime() >= 9);
});

// Test elapsed time calculation
test.test('should calculate elapsed time correctly', () => {
    const timer = new Timer();
    
    timer.start(10);
    test.assertTrue(timer.getElapsedTime() >= 0);
    test.assertTrue(timer.getElapsedTime() <= 1);
});

// Test timer expiration
test.test('should detect timer expiration', () => {
    const timer = new Timer();
    
    timer.start(0);
    test.assertTrue(timer.isExpired());
    
    timer.start(1);
    test.assertFalse(timer.isExpired());
});

// Test time formatting
test.test('should format time correctly', () => {
    const timer = new Timer();
    
    test.assertEqual(timer.formatTime(0), '00:00');
    test.assertEqual(timer.formatTime(30), '00:30');
    test.assertEqual(timer.formatTime(60), '01:00');
    test.assertEqual(timer.formatTime(90), '01:30');
    test.assertEqual(timer.formatTime(3661), '61:01');
});

// Test timer status
test.test('should return correct timer status', () => {
    const timer = new Timer();
    
    timer.start(10);
    const status = timer.getStatus();
    
    test.assertTrue(status.isRunning);
    test.assertTrue(status.remaining <= 10);
    test.assertTrue(status.elapsed >= 0);
    test.assertEqual(status.duration, 10);
});

// Test callback functions
test.test('should call tick callback', (done) => {
    const timer = new Timer();
    let tickCalled = false;
    
    timer.start(1, () => {
        tickCalled = true;
    });
    
    setTimeout(() => {
        test.assertTrue(tickCalled);
        done();
    }, 100);
});

test.test('should call complete callback', (done) => {
    const timer = new Timer();
    let completeCalled = false;
    
    timer.start(0, null, () => {
        completeCalled = true;
    });
    
    setTimeout(() => {
        test.assertTrue(completeCalled);
        done();
    }, 100);
});

// Test multiple timer instances
test.test('should handle multiple timer instances', () => {
    const timer1 = new Timer();
    const timer2 = new Timer();
    
    timer1.start(10);
    timer2.start(5);
    
    test.assertTrue(timer1.isRunning);
    test.assertTrue(timer2.isRunning);
    test.assertEqual(timer1.duration, 10);
    test.assertEqual(timer2.duration, 5);
    
    timer1.stop();
    test.assertFalse(timer1.isRunning);
    test.assertTrue(timer2.isRunning);
});

// Test edge cases
test.test('should handle negative duration', () => {
    const timer = new Timer();
    
    timer.start(-5);
    test.assertTrue(timer.isExpired());
});

test.test('should handle very short duration', () => {
    const timer = new Timer();
    
    timer.start(0.1);
    test.assertTrue(timer.getRemainingTime() <= 0.1);
});

// Run tests
test.run();
