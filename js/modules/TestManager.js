/**
 * Test Manager Module
 * Handles test flow, question management, and scoring
 */
export class TestManager {
    constructor() {
        this.app = null; // Will be set by dependency injection
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = null;
        this.questionStartTime = null;
        this.isNavigating = false; // Flag to prevent multiple navigation calls
        this.selectedAnswerIndex = null; // Track current selection
        this.timedOutCurrent = false; // Track per-question timeout state
    }
    
    /**
     * Set app reference (dependency injection)
     * @param {Object} app - App instance
     */
    setApp(app) {
        this.app = app;
    }
    
    /**
     * Start a new test
     * @param {Object} settings - Test settings
     */
    startTest(settings) {
        // Cleanup any existing test first
        this.cleanup();
        
        this.currentTest = {
            settings,
            questions: this.app.questionGenerator.generateTestQuestions(settings.questionCount),
            startTime: Date.now(),
            results: null
        };
        
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = Date.now();
        this.isNavigating = false;
        this.selectedAnswerIndex = null;
        this.timedOutCurrent = false;
        
        // Start timer if enabled
        if (settings.timerMode !== 'off') {
            this.startTimer(settings);
        }
        
        // Show test screen and first question
        this.app.ui.showScreen('test-screen');
        this.showCurrentQuestion();
    }
    
    /**
     * Start timer based on settings
     * @param {Object} settings - Test settings
     */
    startTimer(settings) {
        if (settings.timerMode === 'per-question') {
            this.startQuestionTimer(settings.timerDuration);
        } else if (settings.timerMode === 'total-time') {
            this.startTotalTimer(settings.timerDuration);
        }
    }
    
    /**
     * Start question timer
     * @param {number} duration - Duration in seconds
     */
    startQuestionTimer(duration) {
        this.app.timer.start(duration, (remaining) => {
            this.app.ui.updateTimer(remaining);
        }, () => {
            this.handleTimeUp();
        });
    }
    
    /**
     * Start total timer
     * @param {number} duration - Duration in seconds
     */
    startTotalTimer(duration) {
        this.app.timer.start(duration, (remaining) => {
            this.app.ui.updateTimer(remaining);
        }, () => {
            this.handleTimeUp();
        });
    }
    
    /**
     * Show current question
     */
    showCurrentQuestion() {
        if (!this.currentTest || this.currentQuestionIndex >= this.currentTest.questions.length) {
            this.endTest();
            return;
        }
        
        // Reset navigation flag when showing new question
        this.isNavigating = false;
        this.selectedAnswerIndex = null;
        this.timedOutCurrent = false;
        
        const question = this.currentTest.questions[this.currentQuestionIndex];
        this.questionStartTime = Date.now();
        
        // Update UI
        this.app.ui.updateQuestion(question, this.currentQuestionIndex + 1, this.currentTest.questions.length);
        this.app.ui.updateProgress(this.currentQuestionIndex, this.currentTest.questions.length);
        
        // Reset timer for per-question mode
        if (this.currentTest.settings.timerMode === 'per-question') {
            this.startQuestionTimer(this.currentTest.settings.timerDuration);
        }
        
        // Enable answer buttons
        this.enableAnswerButtons();
        
        // Disable next button until user selects an answer or time runs out
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) nextBtn.disabled = true;
    }
    
    /**
     * Enable answer buttons
     */
    enableAnswerButtons() {
        // First remove any existing listeners to prevent duplicates
        this.removeEventListeners();
        
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectAnswer(index));
        });
    }
    
    /**
     * Select an answer
     * @param {number} answerIndex - Index of selected answer
     */
    selectAnswer(answerIndex) {
        if (!this.currentTest || this.isNavigating || this.timedOutCurrent) return;
        
        // Update selected answer index and button styles (allow change before next)
        this.selectedAnswerIndex = answerIndex;
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, idx) => {
            if (idx === answerIndex) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('selected', 'correct', 'incorrect');
                btn.setAttribute('aria-pressed', 'false');
                btn.disabled = false;
            }
        });
        
        // Enable next button now that a selection exists
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) nextBtn.disabled = false;
    }
    
    /**
     * Show answer feedback
     * @param {boolean} isCorrect - Whether answer is correct
     * @param {number} correctAnswer - Correct answer
     */
    showAnswerFeedback(isCorrect, correctAnswer) {
        this.app.ui.showAnswerFeedback(isCorrect, correctAnswer);
    }
    
    /**
     * Disable answer buttons
     */
    disableAnswerButtons() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            // Remove event listeners by cloning
            const newBtn = btn.cloneNode(true);
            newBtn.disabled = true;
            newBtn.className = btn.className;
            newBtn.textContent = btn.textContent;
            newBtn.setAttribute('data-answer', btn.getAttribute('data-answer'));
            newBtn.setAttribute('aria-label', btn.getAttribute('aria-label'));
            newBtn.setAttribute('role', 'button');
            newBtn.setAttribute('tabindex', '-1');
            newBtn.setAttribute('type', 'button');
            newBtn.setAttribute('id', btn.getAttribute('id'));
            newBtn.setAttribute('data-index', btn.getAttribute('data-index'));
            newBtn.setAttribute('data-question', btn.getAttribute('data-question'));
            btn.parentNode.replaceChild(newBtn, btn);
        });
    }
    
    /**
     * Move to next question
     */
    nextQuestion() {
        // Prevent multiple rapid calls
        if (this.isNavigating) {
            return;
        }
        
        this.isNavigating = true;
        
        // Persist user's answer (if any) for the current question
        const question = this.currentTest.questions[this.currentQuestionIndex];
        let userAnswer = null;
        let isCorrect = false;
        
        if (this.timedOutCurrent) {
            // No answer due to timeout in per-question mode
            userAnswer = null;
            isCorrect = false;
        } else if (this.selectedAnswerIndex !== null) {
            userAnswer = question.answers[this.selectedAnswerIndex];
            isCorrect = this.app.questionGenerator.validateAnswer(question, userAnswer);
        }
        
        const timeSpent = this.app.questionGenerator.calculateTimeSpent({ startTime: this.questionStartTime });
        
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            userAnswer,
            isCorrect,
            timeSpent
        });
        
        // Update question record
        question.userAnswer = userAnswer;
        question.isCorrect = isCorrect;
        question.timeSpent = timeSpent;
        
        // Move to next
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentTest.questions.length) {
            this.endTest();
        } else {
            this.showCurrentQuestion();
        }
        
        // Reset navigation flag after a short delay
        setTimeout(() => {
            this.isNavigating = false;
        }, 100);
    }
    
    /**
     * End the test
     */
    endTest() {
        if (!this.currentTest) return;
        
        // Stop timer
        this.app.timer.stop();
        
        // Calculate results
        const results = this.calculateResults();
        this.currentTest.results = results;
        
        // Save results
        this.app.storage.saveTestResults(results);
        
        // Update stats
        this.app.updateQuickStats();
        
        // Show results
        this.showResults(results);
        
        // Play success sound for perfect score
        if (results.scorePercentage === 100 && this.app.soundManager.isEnabled()) {
            this.app.soundManager.playSuccess();
            this.app.ui.showConfetti();
        }
    }
    
    /**
     * Calculate test results
     * @returns {Object} Test results
     */
    calculateResults() {
        const totalQuestions = this.currentTest.questions.length;
        const correctCount = this.userAnswers.filter(answer => answer.isCorrect).length;
        const incorrectCount = totalQuestions - correctCount;
        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        const totalTime = Math.round((Date.now() - this.testStartTime) / 1000);
        
        return {
            totalQuestions,
            correctCount,
            incorrectCount,
            scorePercentage,
            totalTime,
            questions: this.currentTest.questions,
            userAnswers: this.userAnswers,
            settings: this.currentTest.settings,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Show results screen
     * @param {Object} results - Test results
     */
    showResults(results) {
        this.app.ui.showScreen('results-screen');
        this.app.ui.updateResults(results);
    }
    
    /**
     * Handle time up
     */
    handleTimeUp() {
        if (this.currentTest.settings.timerMode === 'per-question') {
            // Time up for this question: disable answers, allow user to click Next manually
            this.timedOutCurrent = true;
            this.disableAnswerButtons();
            const nextBtn = document.getElementById('next-question');
            if (nextBtn) nextBtn.disabled = false;
        } else if (this.currentTest.settings.timerMode === 'total-time') {
            // End test immediately
            this.endTest();
        }
    }
    
    /**
     * Check if can proceed to next question
     * @returns {boolean} True if can proceed
     */
    canProceed() {
        if (!this.currentTest) return false;
        return this.currentQuestionIndex < this.currentTest.questions.length;
    }
    
    /**
     * Get current test results
     * @returns {Object|null} Current test results
     */
    getCurrentResults() {
        return this.currentTest ? this.currentTest.results : null;
    }
    
    /**
     * Get test statistics
     * @returns {Object} Test statistics
     */
    getTestStats() {
        if (!this.currentTest) return null;
        
        const results = this.calculateResults();
        return {
            averageTimePerQuestion: Math.round(results.totalTime / results.totalQuestions),
            accuracy: results.scorePercentage,
            totalTime: results.totalTime,
            correctAnswers: results.correctCount,
            incorrectAnswers: results.incorrectCount
        };
    }
    
    /**
     * Cleanup test resources
     */
    cleanup() {
        if (this.app && this.app.timer) {
            this.app.timer.stop();
        }
        
        // Clear test data
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = null;
        this.questionStartTime = null;
        this.isNavigating = false; // Reset navigation flag
        
        // Remove event listeners
        this.removeEventListeners();
    }
    
    /**
     * Remove event listeners to prevent memory leaks
     */
    removeEventListeners() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            // Clone the button to remove all event listeners
            const newBtn = btn.cloneNode(true);
            newBtn.disabled = btn.disabled;
            newBtn.className = btn.className;
            newBtn.textContent = btn.textContent;
            newBtn.setAttribute('data-answer', btn.getAttribute('data-answer'));
            newBtn.setAttribute('aria-label', btn.getAttribute('aria-label'));
            newBtn.setAttribute('role', 'button');
            newBtn.setAttribute('tabindex', btn.getAttribute('tabindex'));
            newBtn.setAttribute('type', 'button');
            newBtn.setAttribute('id', btn.getAttribute('id'));
            newBtn.setAttribute('data-index', btn.getAttribute('data-index'));
            newBtn.setAttribute('data-question', btn.getAttribute('data-question'));
            btn.parentNode.replaceChild(newBtn, btn);
        });
    }
}
