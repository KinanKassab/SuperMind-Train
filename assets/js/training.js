// SuperMind Trainer - Training Mode

import { questionGenerator } from './questionGenerator.js';
import { Storage, Timer, formatTime, playSound, showNotification, createConfetti } from './utils.js';

/**
 * Training Mode Controller
 */
export class TrainingController {
  constructor() {
    this.currentQuestion = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.startTime = null;
    this.timer = null;
    this.settings = this.loadSettings();
    this.isAnswered = false;
    this.questionStartTime = null;
    
    this.initializeElements();
    this.bindEvents();
    this.startTraining();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.elements = {
      // Progress elements
      currentQuestionEl: document.getElementById('current-question'),
      totalQuestionsEl: document.getElementById('total-questions'),
      progressFillEl: document.getElementById('progress-fill'),
      currentScoreEl: document.getElementById('current-score'),
      
      // Timer elements
      timerDisplayEl: document.getElementById('timer-display'),
      timerTextEl: document.getElementById('timer-text'),
      
      // Question elements
      factorAEl: document.getElementById('factor-a'),
      factorBEl: document.getElementById('factor-b'),
      answerOptionsEl: document.getElementById('answer-options'),
      
      // Feedback elements
      feedbackSectionEl: document.getElementById('feedback-section'),
      feedbackCardEl: document.getElementById('feedback-card'),
      feedbackIconEl: document.getElementById('feedback-icon'),
      feedbackTextEl: document.getElementById('feedback-text'),
      feedbackExplanationEl: document.getElementById('feedback-explanation'),
      
      // Stats elements
      correctCountEl: document.getElementById('correct-count'),
      wrongCountEl: document.getElementById('wrong-count'),
      elapsedTimeEl: document.getElementById('elapsed-time'),
      
      // Completion modal
      completionModalEl: document.getElementById('completion-modal'),
      finalScoreEl: document.getElementById('final-score'),
      finalCorrectEl: document.getElementById('final-correct'),
      finalWrongEl: document.getElementById('final-wrong'),
      finalTimeEl: document.getElementById('final-time'),
      viewResultsBtnEl: document.getElementById('view-results'),
      startNewTrainingBtnEl: document.getElementById('start-new-training')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Answer buttons
    this.elements.answerOptionsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.answer-btn');
      if (btn && !this.isAnswered) {
        this.selectAnswer(parseInt(btn.dataset.answer));
        this.submitAnswer();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.isAnswered) return;
      
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        this.selectAnswer(parseInt(e.key));
        this.submitAnswer();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedBtn = this.elements.answerOptionsEl.querySelector('.answer-btn.selected');
        if (selectedBtn) {
          this.submitAnswer();
        }
      }
    });

    // Completion modal buttons
    this.elements.viewResultsBtnEl?.addEventListener('click', () => this.viewResults());
    this.elements.startNewTrainingBtnEl?.addEventListener('click', () => this.startNewTraining());

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من العودة؟ سيتم فقدان التقدم الحالي.')) {
          window.location.href = '../../index.html';
        }
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.className = `${newTheme}-theme`;
        Storage.save('theme', newTheme);
        this.updateThemeIcon();
      });
    }

    // Language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        const currentLang = document.documentElement.lang;
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        Storage.save('language', newLang);
        this.updateLanguageIcon();
        this.updateTexts();
      });
    }
  }

  /**
   * Load training settings
   */
  loadSettings() {
    const defaultSettings = {
      questionCount: 10,
      timerMode: 'off',
      timerDuration: 4,
      soundEnabled: true,
      difficulty: 'normal'
    };

    const savedSettings = Storage.load('trainingSettings', defaultSettings);
    return { ...defaultSettings, ...savedSettings };
  }

  /**
   * Start training session
   */
  startTraining() {
    this.questions = questionGenerator.generateQuestions(this.settings.questionCount, {
      difficulty: this.settings.difficulty,
      avoidDuplicates: true
    });

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.startTime = Date.now();
    this.isAnswered = false;

    this.updateProgress();
    this.showQuestion();
    this.startElapsedTimer();
  }

  /**
   * Show current question
   */
  showQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.completeTraining();
      return;
    }

    this.currentQuestion = this.questions[this.currentIndex];
    this.isAnswered = false;
    this.questionStartTime = Date.now();

    // Update question display
    this.elements.factorAEl.textContent = this.currentQuestion.factorA;
    this.elements.factorBEl.textContent = this.currentQuestion.factorB;

    // Update answer options
    this.updateAnswerOptions();

    // Hide feedback
    this.elements.feedbackSectionEl.style.display = 'none';

    // Focus first answer button
    const firstBtn = this.elements.answerOptionsEl.querySelector('.answer-btn');
    if (firstBtn) {
      firstBtn.focus();
    }
  }

  /**
   * Update answer options display
   */
  updateAnswerOptions() {
    const buttons = this.elements.answerOptionsEl.querySelectorAll('.answer-btn');
    
    buttons.forEach((btn, index) => {
      const option = this.currentQuestion.options[index];
      if (option) {
        btn.dataset.answer = option.position;
        btn.querySelector('.answer-value').textContent = option.value;
        btn.className = 'answer-btn';
        btn.disabled = false;
        btn.tabIndex = index + 1;
      }
    });
  }

  /**
   * Select an answer
   */
  selectAnswer(position) {
    if (this.isAnswered) return;

    // Remove previous selection
    this.elements.answerOptionsEl.querySelectorAll('.answer-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Find and select the clicked button
    const selectedBtn = this.elements.answerOptionsEl.querySelector(`[data-answer="${position}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
  }

  /**
   * Submit selected answer
   */
  submitAnswer() {
    if (this.isAnswered) return;

    const selectedBtn = this.elements.answerOptionsEl.querySelector('.answer-btn.selected');
    if (!selectedBtn) return;

    const selectedPosition = parseInt(selectedBtn.dataset.answer);
    const selectedOption = this.currentQuestion.options.find(opt => opt.position === selectedPosition);
    
    if (!selectedOption) return;

    this.isAnswered = true;
    const isCorrect = selectedOption.isCorrect;
    const responseTime = Date.now() - this.questionStartTime;

    // Update score
    if (isCorrect) {
      this.correctCount++;
      this.score = Math.round((this.correctCount / (this.correctCount + this.wrongCount)) * 100);
    } else {
      this.wrongCount++;
      this.score = Math.round((this.correctCount / (this.correctCount + this.wrongCount)) * 100);
    }

    // Show feedback
    this.showFeedback(isCorrect, selectedOption, responseTime);

    // Play sound
    if (this.settings.soundEnabled) {
      playSound(isCorrect ? 'correct' : 'wrong');
    }

    // Update stats
    this.updateStats();


    // Disable all answer buttons
    this.elements.answerOptionsEl.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('selected'); // Clear selected state
      if (btn.dataset.answer == selectedPosition) {
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
      } else if (this.currentQuestion.options.find(opt => 
        opt.position == btn.dataset.answer && opt.isCorrect)) {
        btn.classList.add('correct');
      }
    });

    // Save question result
    this.saveQuestionResult(isCorrect, responseTime);

    // Auto move to next question after delay
    setTimeout(() => {
      this.nextQuestion();
    }, 1000);
  }

  /**
   * Show feedback for the answer
   */
  showFeedback(isCorrect, selectedOption, responseTime) {
    this.elements.feedbackIconEl.textContent = isCorrect ? '✅' : '❌';
    this.elements.feedbackTextEl.textContent = isCorrect ? 
      'إجابة صحيحة!' : 'إجابة خاطئة!';
    
    const explanation = `${this.currentQuestion.factorA} × ${this.currentQuestion.factorB} = ${this.currentQuestion.correctAnswer}`;
    this.elements.feedbackExplanationEl.textContent = explanation;

    this.elements.feedbackCardEl.className = `feedback-card ${isCorrect ? 'correct' : 'wrong'}`;
    this.elements.feedbackSectionEl.style.display = 'block';
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    this.currentIndex++;
    this.updateProgress();
    this.showQuestion();
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const progress = (this.currentIndex / this.questions.length) * 100;
    this.elements.progressFillEl.style.width = `${progress}%`;
    this.elements.currentQuestionEl.textContent = this.currentIndex + 1;
    this.elements.totalQuestionsEl.textContent = this.questions.length;
    this.elements.currentScoreEl.textContent = this.score;
  }

  /**
   * Update statistics display
   */
  updateStats() {
    this.elements.correctCountEl.textContent = this.correctCount;
    this.elements.wrongCountEl.textContent = this.wrongCount;
  }

  /**
   * Start elapsed time timer
   */
  startElapsedTimer() {
    setInterval(() => {
      if (this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.elements.elapsedTimeEl.textContent = formatTime(elapsed);
      }
    }, 1000);
  }

  /**
   * Complete training session
   */
  completeTraining() {
    const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Update completion modal
    this.elements.finalScoreEl.textContent = `${this.score}%`;
    this.elements.finalCorrectEl.textContent = this.correctCount;
    this.elements.finalWrongEl.textContent = this.wrongCount;
    this.elements.finalTimeEl.textContent = formatTime(totalTime);

    // Show completion modal
    this.elements.completionModalEl.classList.add('show');
    this.elements.completionModalEl.setAttribute('aria-hidden', 'false');

    // Show confetti for perfect score
    if (this.score === 100) {
      const confettiContainer = document.getElementById('confetti-container');
      if (confettiContainer) {
        createConfetti(confettiContainer, 100);
      }
    }

    // Save training result
    this.saveTrainingResult(totalTime);

    // Play completion sound
    if (this.settings.soundEnabled) {
      playSound('correct');
    }
  }

  /**
   * Save question result
   */
  saveQuestionResult(isCorrect, responseTime) {
    const result = {
      questionId: this.currentQuestion.id,
      factorA: this.currentQuestion.factorA,
      factorB: this.currentQuestion.factorB,
      correctAnswer: this.currentQuestion.correctAnswer,
      isCorrect,
      responseTime,
      timestamp: Date.now()
    };

    const results = Storage.load('trainingResults', []);
    results.push(result);
    Storage.save('trainingResults', results);
  }

  /**
   * Save training result
   */
  saveTrainingResult(totalTime) {
    const result = {
      id: `training_${Date.now()}`,
      type: 'training',
      score: this.score,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalQuestions: this.questions.length,
      totalTime,
      averageResponseTime: this.calculateAverageResponseTime(),
      difficulty: this.settings.difficulty,
      timestamp: Date.now(),
      questions: this.questions.map(q => ({
        id: q.id,
        factorA: q.factorA,
        factorB: q.factorB,
        correctAnswer: q.correctAnswer
      }))
    };

    const results = Storage.load('trainingSessions', []);
    results.push(result);
    Storage.save('trainingSessions', results);

    // Update quick stats
    this.updateQuickStats();
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    const results = Storage.load('trainingResults', []);
    const sessionResults = results.slice(-this.questions.length);
    
    if (sessionResults.length === 0) return 0;
    
    const totalTime = sessionResults.reduce((sum, result) => sum + result.responseTime, 0);
    return Math.round(totalTime / sessionResults.length);
  }

  /**
   * Update quick stats on main page
   */
  updateQuickStats() {
    const sessions = Storage.load('trainingSessions', []);
    const totalQuestions = sessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
    const totalTime = sessions.reduce((sum, session) => sum + session.totalTime, 0);

    Storage.save('quickStats', {
      totalQuestions,
      bestScore,
      totalTime
    });
  }

  /**
   * View detailed results
   */
  viewResults() {
    const result = {
      type: 'training',
      score: this.score,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalQuestions: this.questions.length,
      totalTime: Math.floor((Date.now() - this.startTime) / 1000),
      questions: this.questions
    };

    Storage.save('currentResult', result);
    window.location.href = 'results.html';
  }

  /**
   * Start new training session
   */
  startNewTraining() {
    this.elements.completionModalEl.classList.remove('show');
    this.elements.completionModalEl.setAttribute('aria-hidden', 'true');
    this.startTraining();
  }

  /**
   * Update theme icon
   */
  updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
  }

  /**
   * Update language icon
   */
  updateLanguageIcon() {
    const icon = document.querySelector('.lang-icon');
    if (icon) {
      const currentLang = document.documentElement.lang;
      icon.textContent = currentLang === 'ar' ? 'EN' : 'ع';
    }
  }

  /**
   * Update all text elements based on current language
   */
  updateTexts() {
    const currentLang = document.documentElement.lang;
    const elements = document.querySelectorAll('[data-ar][data-en]');
    
    elements.forEach(element => {
      const text = element.getAttribute(`data-${currentLang}`);
      if (text) {
        if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
          element.textContent = text;
        }
      }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]');
    placeholderElements.forEach(element => {
      const placeholder = element.getAttribute(`data-placeholder-${currentLang}`);
      if (placeholder && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        element.placeholder = placeholder;
      }
    });
  }
}

// Initialize training controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TrainingController();
});
