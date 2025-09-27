/**
 * Test Manager Module
 * Handles test flow, question management, and scoring
 */
export class TestManager {
    constructor(app) {
        this.app = app;
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = null;
        this.questionStartTime = null;
    }
    
    /**
     * Start a new test
     * @param {Object} settings - Test settings
     */
    startTest(settings) {
        this.currentTest = {
            settings,
            questions: this.app.questionGenerator.generateTestQuestions(settings.questionCount),
            startTime: Date.now(),
            results: null
        };
        
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = Date.now();
        
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
        
        // Disable next button
        document.getElementById('next-question').disabled = true;
    }
    
    /**
     * Enable answer buttons
     */
    enableAnswerButtons() {
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
        if (!this.currentTest) return;
        
        const question = this.currentTest.questions[this.currentQuestionIndex];
        const selectedAnswer = question.answers[answerIndex];
        const isCorrect = this.app.questionGenerator.validateAnswer(question, selectedAnswer);
        
        // Calculate time spent on this question
        const timeSpent = this.app.questionGenerator.calculateTimeSpent({
            startTime: this.questionStartTime
        });
        
        // Store user answer
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            userAnswer: selectedAnswer,
            isCorrect,
            timeSpent
        });
        
        // Update question with user's answer
        question.userAnswer = selectedAnswer;
        question.isCorrect = isCorrect;
        question.timeSpent = timeSpent;
        
        // Show feedback
        this.showAnswerFeedback(isCorrect, question.correctAnswer);
        
        // Play sound
        if (this.app.soundManager.isEnabled()) {
            if (isCorrect) {
                this.app.soundManager.playCorrect();
            } else {
                this.app.soundManager.playIncorrect();
            }
        }
        
        // Disable answer buttons
        this.disableAnswerButtons();
        
        // Enable next button
        document.getElementById('next-question').disabled = false;
        
        // Auto-advance in practice mode
        if (this.currentTest.settings.testMode === 'practice') {
            setTimeout(() => {
                if (this.canProceed()) {
                    this.nextQuestion();
                }
            }, 1500);
        }
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
            btn.disabled = true;
            btn.removeEventListener('click', this.selectAnswer);
        });
    }
    
    /**
     * Move to next question
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.currentTest.questions.length) {
            this.endTest();
        } else {
            this.showCurrentQuestion();
        }
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
            // Auto-select no answer for current question
            this.userAnswers.push({
                questionIndex: this.currentQuestionIndex,
                userAnswer: null,
                isCorrect: false,
                timeSpent: this.currentTest.settings.timerDuration
            });
            
            // Move to next question
            this.nextQuestion();
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
        return this.currentQuestionIndex < this.currentTest.questions.length - 1;
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
}
