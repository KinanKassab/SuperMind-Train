// SuperMind Trainer - Exam Mode

import { questionGenerator } from './questionGenerator.js';
import { Storage, Timer, formatTime, playSound, showNotification } from './utils.js';

/**
 * Exam Mode Controller
 */
export class ExamController {
  constructor() {
    this.currentQuestion = null;
    this.questions = [];
    this.currentIndex = 0;
    this.answers = [];
    this.startTime = null;
    this.questionTimer = null;
    this.examTimer = null;
    this.settings = this.loadSettings();
    this.isAnswered = false;
    this.questionStartTime = null;
    this.warningShown = false;
    
    this.initializeElements();
    this.bindEvents();
    this.startExam();
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
      timeRemainingEl: document.getElementById('time-remaining'),
      
      // Timer elements
      timerDisplayEl: document.getElementById('timer-display'),
      timerTextEl: document.getElementById('timer-text'),
      
      // Question elements
      factorAEl: document.getElementById('factor-a'),
      factorBEl: document.getElementById('factor-b'),
      answerOptionsEl: document.getElementById('answer-options'),
      
      // Action buttons
      prevBtnEl: document.getElementById('prev-btn'),
      nextBtnEl: document.getElementById('next-btn'),
      endExamBtnEl: document.getElementById('end-exam-btn'),
      
      // Completion modal
      examCompletionModalEl: document.getElementById('exam-completion-modal'),
      examTotalQuestionsEl: document.getElementById('exam-total-questions'),
      examTimeTakenEl: document.getElementById('exam-time-taken'),
      viewExamResultsBtnEl: document.getElementById('view-exam-results'),
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
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        this.selectAnswer(parseInt(e.key));
      } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.goPrev();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        this.requestEndExam();
      }
    });

    // Action buttons
    this.elements.prevBtnEl?.addEventListener('click', () => this.goPrev());
    this.elements.nextBtnEl?.addEventListener('click', () => this.goNext());
    this.elements.endExamBtnEl?.addEventListener('click', () => this.requestEndExam());
    
    // Completion modal buttons
    this.elements.viewExamResultsBtnEl?.addEventListener('click', () => this.viewResults());

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (true) {
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

    // Prevent page refresh during exam
    window.addEventListener('beforeunload', (e) => {
      if (!this.isExamComplete) {
        e.preventDefault();
        e.returnValue = 'هل أنت متأكد من مغادرة الصفحة؟ سيتم فقدان التقدم الحالي.';
      }
    });
  }

  /**
   * Load exam settings
   */
  loadSettings() {
    const defaultSettings = {
      questionCount: 10,
      timerMode: 'total-time',
      timerDuration: 300, // 5 minutes
      soundEnabled: true,
      difficulty: 'medium',
      multiplicationRule: 'random',
      allowSkip: true
    };

    const savedSettings = Storage.load('examSettings', defaultSettings);
    return { ...defaultSettings, ...savedSettings };
  }

  /**
   * Start exam session
   */
  startExam() {
    this.questions = questionGenerator.generateQuestions(this.settings.questionCount, {
      difficulty: this.settings.difficulty,
      avoidDuplicates: true,
      ruleType: this.settings.multiplicationRule === 'random' ? null : parseInt(this.settings.multiplicationRule),
      useMultiplicationRules: true
    });

    this.currentIndex = 0;
    this.answers = [];
    this.tempSelections = [];
    this.timeSpentByIndex = [];
    this.startTime = Date.now();
    this.isAnswered = false;
    this.isExamComplete = false;
    this.warningShown = false;

    this.updateProgress();
    this.showQuestion();
    this.startExamTimer();
  }

  /**
   * Show current question
   */
  showQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.completeExam();
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

    // Restore previous selection if exists
    this.restoreSelection();

    // Update nav buttons state
    this.updateNavButtonsState();

    // Start question timer if enabled
    if (this.settings.timerMode === 'per-question') {
      this.startQuestionTimer();
    }

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
    // Remove previous selection
    this.elements.answerOptionsEl.querySelectorAll('.answer-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Add selection to clicked button
    const selectedBtn = this.elements.answerOptionsEl.querySelector(`[data-answer="${position}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
      // Save temporary selection for this index
      this.tempSelections[this.currentIndex] = position;
    }
  }

  // Navigation helpers
  goPrev() {
    this.captureTimeSpent();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateProgress();
      this.showQuestion();
    }
  }

  goNext() {
    this.captureTimeSpent();
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.updateProgress();
      this.showQuestion();
    } else if (this.currentIndex === this.questions.length - 1) {
      // At last question, prompt to end
      this.requestEndExam();
    }
  }

  updateNavButtonsState() {
    if (this.elements.prevBtnEl) {
      this.elements.prevBtnEl.disabled = this.currentIndex === 0;
    }
    if (this.elements.nextBtnEl) {
      this.elements.nextBtnEl.textContent = (this.currentIndex === this.questions.length - 1)
        ? (document.documentElement.lang === 'ar' ? 'إنهاء' : 'Finish')
        : (document.documentElement.lang === 'ar' ? 'التالي' : 'Next');
    }
  }

  restoreSelection() {
    // Clear any previous state
    this.elements.answerOptionsEl.querySelectorAll('.answer-btn').forEach(btn => btn.classList.remove('selected'));
    const position = this.tempSelections[this.currentIndex];
    if (position) {
      const btn = this.elements.answerOptionsEl.querySelector(`[data-answer="${position}"]`);
      if (btn) btn.classList.add('selected');
    }
  }

  captureTimeSpent() {
    if (this.questionStartTime) {
      const spent = Date.now() - this.questionStartTime;
      this.timeSpentByIndex[this.currentIndex] = (this.timeSpentByIndex[this.currentIndex] || 0) + spent;
    }
    if (this.questionTimer) {
      this.questionTimer.stop();
    }
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    // Backwards compatibility if called elsewhere
    this.goNext();
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const progress = (this.currentIndex / this.questions.length) * 100;
    this.elements.progressFillEl.style.width = `${progress}%`;
    this.elements.currentQuestionEl.textContent = this.currentIndex + 1;
    this.elements.totalQuestionsEl.textContent = this.questions.length;
  }

  /**
   * Start exam timer
   */
  startExamTimer() {
    if (this.settings.timerMode === 'total-time') {
      this.examTimer = new Timer(
        this.settings.timerDuration,
        (remaining) => {
          this.elements.timeRemainingEl.textContent = formatTime(remaining);
        },
        () => {
          // Time's up - auto submit exam
          this.autoSubmitExam();
        }
      );

      this.examTimer.start();
    }
  }

  /**
   * Start question timer
   */
  startQuestionTimer() {
    if (this.questionTimer) {
      this.questionTimer.stop();
    }

    this.questionTimer = new Timer(
      this.settings.timerDuration,
      (remaining) => {
        this.elements.timerTextEl.textContent = remaining;
        this.elements.timerDisplayEl.style.display = 'block';
        
        if (remaining <= 5) {
          this.elements.timerDisplayEl.style.animation = 'pulse 0.5s infinite';
        }
      },
      () => {
        // Time's up - move to next
        this.goNext();
      }
    );

    this.questionTimer.start();
  }

  /**
   * Auto submit current question
   */
  autoSubmitQuestion() {
    // No-op in navigation mode
  }

  /**
   * Auto submit exam when time runs out
   */
  autoSubmitExam() {
    this.requestFinalizeAndComplete();
  }
  /**
   * Complete exam session
   */
  completeExam() {
    this.isExamComplete = true;
    const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Stop all timers
    if (this.examTimer) {
      this.examTimer.stop();
    }
    if (this.questionTimer) {
      this.questionTimer.stop();
    }

    // Build answers from selections if not already built
    this.buildAnswersFromSelections();

    // Calculate results
    const correctCount = this.answers.filter(a => a && a.isCorrect).length;
    const wrongCount = this.answers.filter(a => a && !a.isCorrect && !a.skipped).length;
    const skippedCount = this.answers.filter(a => a && a.skipped).length;
    const score = Math.round((correctCount / this.questions.length) * 100);

    // Update completion modal
    this.elements.examTotalQuestionsEl.textContent = this.questions.length;
    this.elements.examTimeTakenEl.textContent = formatTime(totalTime);

    // Show completion modal
    this.elements.examCompletionModalEl.classList.add('show');
    this.elements.examCompletionModalEl.setAttribute('aria-hidden', 'false');

    // Save exam result
    this.saveExamResult(totalTime, correctCount, wrongCount, skippedCount, score);

    // Play completion sound
    if (this.settings.soundEnabled) {
      playSound('correct');
    }

    // Show notification
    showNotification('تم إكمال الاختبار بنجاح!', 'success', 3000);
  }

  /**
   * Save exam result
   */
  saveExamResult(totalTime, correctCount, wrongCount, skippedCount, score) {
    const result = {
      id: `exam_${Date.now()}`,
      type: 'exam',
      score,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions: this.questions.length,
      totalTime,
      averageResponseTime: this.calculateAverageResponseTime(),
      difficulty: this.settings.difficulty,
      timerMode: this.settings.timerMode,
      timestamp: Date.now(),
      questions: this.questions.map((q, index) => ({
        id: q.id,
        factorA: q.factorA,
        factorB: q.factorB,
        correctAnswer: q.correctAnswer,
        userAnswer: this.answers[index]?.selectedAnswer || null,
        isCorrect: this.answers[index]?.isCorrect || false,
        responseTime: this.answers[index]?.responseTime || 0,
        skipped: this.answers[index]?.skipped || false
      }))
    };

    const results = Storage.load('examSessions', []);
    results.push(result);
    Storage.save('examSessions', results);

    // Update quick stats
    this.updateQuickStats();

    // Store current result for results page
    Storage.save('currentResult', result);
  }

  requestEndExam() {
    // Basic confirmation
    const confirmMsg = document.documentElement.lang === 'ar'
      ? 'هل تريد إنهاء الاختبار الآن؟'
      : 'Do you want to end the exam now?';
    if (confirm(confirmMsg)) {
      this.requestFinalizeAndComplete();
    }
  }

  requestFinalizeAndComplete() {
    // Capture time for current question before finishing
    this.captureTimeSpent();
    // Build answers and complete
    this.buildAnswersFromSelections();
    this.completeExam();
  }

  buildAnswersFromSelections() {
    // Build answers array aligned with questions
    this.answers = this.questions.map((q, index) => {
      const position = this.tempSelections[index];
      const option = position ? q.options.find(o => o.position === position) : null;
      const selectedValue = option ? option.value : null;
      const isCorrect = option ? option.isCorrect : false;
      const responseTime = this.timeSpentByIndex[index] || 0;
      const skipped = !option;
      return {
        questionId: q.id,
        questionIndex: index,
        selectedAnswer: selectedValue,
        isCorrect,
        responseTime,
        skipped,
        timestamp: Date.now()
      };
    });
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    const answeredQuestions = this.answers.filter(answer => !answer.skipped);
    
    if (answeredQuestions.length === 0) return 0;
    
    const totalTime = answeredQuestions.reduce((sum, answer) => sum + answer.responseTime, 0);
    return Math.round(totalTime / answeredQuestions.length);
  }

  /**
   * Update quick stats on main page
   */
  updateQuickStats() {
    const sessions = Storage.load('examSessions', []);
    const trainingSessions = Storage.load('trainingSessions', []);
    const allSessions = [...sessions, ...trainingSessions];
    
    const totalQuestions = allSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const bestScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
    const trainingBestScore = trainingSessions.length > 0 ? Math.max(...trainingSessions.map(s => s.score)) : 0;
    const overallBestScore = Math.max(bestScore, trainingBestScore);
    const totalTime = allSessions.reduce((sum, session) => sum + session.totalTime, 0);

    const currentStats = Storage.load('quickStats', {
      totalQuestions: 0,
      bestScore: 0,
      totalTime: 0
    });

    Storage.save('quickStats', {
      totalQuestions,
      bestScore: Math.max(currentStats.bestScore, overallBestScore),
      totalTime
    });
  }

  /**
   * View detailed results
   */
  viewResults() {
    window.location.href = 'results.html';
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

// Initialize exam controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExamController();
});
