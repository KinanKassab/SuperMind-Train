// SuperMind Trainer - Results Page

import { Storage, formatTime, formatDate, exportToCSV, exportToJSON, createConfetti, showNotification } from './utils.js';

/**
 * Results Page Controller
 */
export class ResultsController {
  constructor() {
    this.currentResult = null;
    this.initializeElements();
    this.bindEvents();
    this.loadResults();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.elements = {
      // Summary elements
      testTypeEl: document.getElementById('test-type'),
      finalScoreEl: document.getElementById('final-score'),
      correctAnswersEl: document.getElementById('correct-answers'),
      wrongAnswersEl: document.getElementById('wrong-answers'),
      totalTimeEl: document.getElementById('total-time'),
      
      // Detailed results
      questionsListEl: document.getElementById('questions-list'),
      
      // Performance analysis
      avgResponseTimeEl: document.getElementById('avg-response-time'),
      accuracyRateEl: document.getElementById('accuracy-rate'),
      progressIndicatorEl: document.getElementById('progress-indicator'),
      
      // Action buttons
      exportCsvBtnEl: document.getElementById('export-csv'),
      exportJsonBtnEl: document.getElementById('export-json'),
      printResultsBtnEl: document.getElementById('print-results'),
      retryTestBtnEl: document.getElementById('retry-test'),
      newTestBtnEl: document.getElementById('new-test'),
      saveScoreBtnEl: document.getElementById('save-score'),
      
      // Save score modal
      saveScoreModalEl: document.getElementById('save-score-modal'),
      playerNameInputEl: document.getElementById('player-name'),
      scoreCommentInputEl: document.getElementById('score-comment'),
      cancelSaveBtnEl: document.getElementById('cancel-save'),
      confirmSaveBtnEl: document.getElementById('confirm-save'),
      
      // Confetti container
      confettiContainerEl: document.getElementById('confetti-container')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Action buttons
    this.elements.exportCsvBtnEl?.addEventListener('click', () => this.exportResults('csv'));
    this.elements.exportJsonBtnEl?.addEventListener('click', () => this.exportResults('json'));
    this.elements.printResultsBtnEl?.addEventListener('click', () => this.printResults());
    this.elements.retryTestBtnEl?.addEventListener('click', () => this.retryTest());
    this.elements.newTestBtnEl?.addEventListener('click', () => this.startNewTest());
    this.elements.saveScoreBtnEl?.addEventListener('click', () => this.showSaveScoreModal());

    // Save score modal
    this.elements.cancelSaveBtnEl?.addEventListener('click', () => this.hideSaveScoreModal());
    this.elements.confirmSaveBtnEl?.addEventListener('click', () => this.saveScore());

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = '../../index.html';
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
   * Load and display results
   */
  loadResults() {
    this.currentResult = Storage.load('currentResult', null);
    
    if (!this.currentResult) {
      showNotification('لا توجد نتائج لعرضها', 'error', 3000);
      setTimeout(() => {
        window.location.href = '../../index.html';
      }, 2000);
      return;
    }

    this.displayResults();
    this.showConfettiIfPerfect();
  }

  /**
   * Display results summary
   */
  displayResults() {
    const { type, score, correctCount, wrongCount, totalTime, totalQuestions } = this.currentResult;

    // Update test type
    this.elements.testTypeEl.textContent = type === 'training' ? 'وضع التدريب' : 'وضع الاختبار';

    // Update score
    this.elements.finalScoreEl.textContent = `${score}%`;

    // Update counts
    this.elements.correctAnswersEl.textContent = correctCount;
    this.elements.wrongAnswersEl.textContent = wrongCount;
    this.elements.totalTimeEl.textContent = formatTime(totalTime);

    // Update detailed questions
    this.displayDetailedQuestions();

    // Update performance analysis
    this.updatePerformanceAnalysis();
  }

  /**
   * Display detailed questions
   */
  displayDetailedQuestions() {
    if (!this.currentResult.questions) return;

    this.elements.questionsListEl.innerHTML = '';

    this.currentResult.questions.forEach((question, index) => {
      const questionEl = this.createQuestionElement(question, index);
      this.elements.questionsListEl.appendChild(questionEl);
    });
  }

  /**
   * Create question element
   */
  createQuestionElement(question, index) {
    const questionEl = document.createElement('div');
    questionEl.className = `question-item ${question.isCorrect ? 'correct' : 'wrong'}`;

    const userAnswer = question.userAnswer !== null ? question.userAnswer : 'لم يتم الإجابة';
    const responseTime = question.responseTime ? formatTime(Math.floor(question.responseTime / 1000)) : '0:00';

    questionEl.innerHTML = `
      <div class="question-header">
        <span class="question-number">سؤال ${index + 1}</span>
        <span class="question-status ${question.isCorrect ? 'correct' : 'wrong'}">
          ${question.isCorrect ? 'صحيح' : 'خطأ'}
        </span>
      </div>
      <div class="question-problem">
        ${question.factorA} × ${question.factorB} = ${question.correctAnswer}
      </div>
      <div class="question-answer">
        <span class="answer-given">إجابتك: ${userAnswer}</span>
        <span class="answer-correct">الإجابة الصحيحة: ${question.correctAnswer}</span>
        <span class="response-time">الوقت: ${responseTime}</span>
      </div>
    `;

    return questionEl;
  }

  /**
   * Update performance analysis
   */
  updatePerformanceAnalysis() {
    const { averageResponseTime, score } = this.currentResult;
    const previousResults = this.getPreviousResults();
    const previousScore = this.getPreviousBestScore(previousResults);

    // Update average response time
    this.elements.avgResponseTimeEl.textContent = `متوسط الوقت: ${formatTime(Math.floor(averageResponseTime / 1000))}`;

    // Update accuracy rate
    this.elements.accuracyRateEl.textContent = `معدل الدقة: ${score}%`;

    // Update progress indicator
    if (previousScore > 0) {
      if (score > previousScore) {
        this.elements.progressIndicatorEl.textContent = 'تحسن مقارنة بالجلسة السابقة';
        this.elements.progressIndicatorEl.style.color = 'var(--success-color)';
      } else if (score < previousScore) {
        this.elements.progressIndicatorEl.textContent = 'انخفاض مقارنة بالجلسة السابقة';
        this.elements.progressIndicatorEl.style.color = 'var(--warning-color)';
      } else {
        this.elements.progressIndicatorEl.textContent = 'نفس مستوى الجلسة السابقة';
        this.elements.progressIndicatorEl.style.color = 'var(--text-secondary)';
      }
    } else {
      this.elements.progressIndicatorEl.textContent = 'هذه أول جلسة لك';
      this.elements.progressIndicatorEl.style.color = 'var(--primary-color)';
    }
  }

  /**
   * Get previous results
   */
  getPreviousResults() {
    const trainingResults = Storage.load('trainingSessions', []);
    const examResults = Storage.load('examSessions', []);
    return [...trainingResults, ...examResults].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get previous best score
   */
  getPreviousBestScore(results) {
    if (results.length <= 1) return 0;
    return results[1]?.score || 0;
  }

  /**
   * Show confetti for perfect score
   */
  showConfettiIfPerfect() {
    if (this.currentResult.score === 100 && this.elements.confettiContainerEl) {
      createConfetti(this.elements.confettiContainerEl, 100);
    }
  }

  /**
   * Export results to CSV
   */
  exportResults(format = 'csv') {
    if (!this.currentResult) return;

    const timestamp = new Date().toISOString().split('T')[0];
    let success = false;

    if (format === 'json') {
      const jsonData = this.prepareJSONData();
      const filename = `results_${this.currentResult.type}_${timestamp}`;
      success = exportToJSON(jsonData, filename);
    } else {
      const csvData = this.prepareCSVData();
      const filename = `results_${this.currentResult.type}_${timestamp}.csv`;
      
      success = exportToCSV(csvData, filename, [
        'Question Number',
        'Factor A',
        'Factor B',
        'Correct Answer',
        'User Answer',
        'Is Correct',
        'Response Time (seconds)',
        'Skipped'
      ]);
    }

    if (success) {
      const formatText = format === 'json' ? 'JSON' : 'CSV';
      showNotification(`تم تصدير النتائج بصيغة ${formatText} بنجاح`, 'success', 3000);
    } else {
      showNotification('فشل في تصدير النتائج', 'error', 3000);
    }
  }

  /**
   * Prepare CSV data
   */
  prepareCSVData() {
    if (!this.currentResult.questions) return [];

    return this.currentResult.questions.map((question, index) => [
      index + 1,
      question.factorA,
      question.factorB,
      question.correctAnswer,
      question.userAnswer || '',
      question.isCorrect ? 'Yes' : 'No',
      Math.floor(question.responseTime / 1000),
      question.skipped ? 'Yes' : 'No'
    ]);
  }

  /**
   * Prepare JSON data
   */
  prepareJSONData() {
    return {
      exportDate: new Date().toISOString(),
      testType: this.currentResult.type,
      summary: {
        totalQuestions: this.currentResult.totalQuestions,
        correctAnswers: this.currentResult.correctAnswers,
        wrongAnswers: this.currentResult.wrongAnswers,
        score: this.currentResult.score,
        totalTime: this.currentResult.totalTime,
        difficulty: this.currentResult.difficulty || 'Normal',
        timestamp: this.currentResult.timestamp
      },
      questions: this.currentResult.questions.map((question, index) => ({
        questionNumber: index + 1,
        factorA: question.factorA,
        factorB: question.factorB,
        correctAnswer: question.correctAnswer,
        userAnswer: question.userAnswer,
        isCorrect: question.isCorrect,
        responseTime: question.responseTime,
        skipped: question.skipped || false
      })),
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(),
        accuracyRate: this.currentResult.score,
        improvement: this.calculateImprovement()
      }
    };
  }

  /**
   * Print results
   */
  printResults() {
    window.print();
  }

  /**
   * Retry the same test
   */
  retryTest() {
    const testType = this.currentResult.type;
    window.location.href = testType === 'training' ? 'assets/html/training.html' : 'exam.html';
  }

  /**
   * Start new test
   */
  startNewTest() {
    window.location.href = '../../index.html';
  }

  /**
   * Show save score modal
   */
  showSaveScoreModal() {
    this.elements.saveScoreModalEl.classList.add('show');
    this.elements.saveScoreModalEl.setAttribute('aria-hidden', 'false');
    this.elements.playerNameInputEl.focus();
  }

  /**
   * Hide save score modal
   */
  hideSaveScoreModal() {
    this.elements.saveScoreModalEl.classList.remove('show');
    this.elements.saveScoreModalEl.setAttribute('aria-hidden', 'true');
    this.elements.playerNameInputEl.value = '';
    this.elements.scoreCommentInputEl.value = '';
  }

  /**
   * Save score to leaderboard
   */
  saveScore() {
    const playerName = this.elements.playerNameInputEl.value.trim();
    const comment = this.elements.scoreCommentInputEl.value.trim();

    if (!playerName) {
      showNotification('يرجى إدخال اسم اللاعب', 'error', 3000);
      return;
    }

    const scoreData = {
      id: `score_${Date.now()}`,
      playerName,
      comment,
      type: this.currentResult.type,
      score: this.currentResult.score,
      correctCount: this.currentResult.correctCount,
      wrongCount: this.currentResult.wrongCount,
      totalQuestions: this.currentResult.totalQuestions,
      totalTime: this.currentResult.totalTime,
      difficulty: this.currentResult.difficulty,
      timestamp: Date.now()
    };

    const leaderboard = Storage.load('leaderboard', []);
    leaderboard.push(scoreData);
    Storage.save('leaderboard', leaderboard);

    this.hideSaveScoreModal();
    showNotification('تم حفظ النتيجة بنجاح', 'success', 3000);

    // Update save button
    this.elements.saveScoreBtnEl.textContent = 'تم الحفظ';
    this.elements.saveScoreBtnEl.disabled = true;
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

// Initialize results controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ResultsController();
});
