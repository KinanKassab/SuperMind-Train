// SuperMind Trainer - Leaderboard

import { Storage, formatTime, formatDate, exportToCSV, showNotification } from './utils.js';

/**
 * Leaderboard Controller
 */
export class LeaderboardController {
  constructor() {
    this.leaderboard = [];
    this.filteredLeaderboard = [];
    this.currentFilters = {
      mode: 'all',
      sortBy: 'score',
      timeRange: 'all'
    };
    
    this.initializeElements();
    this.bindEvents();
    this.loadLeaderboard();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.elements = {
      // Filter controls
      filterModeEl: document.getElementById('filter-mode'),
      sortByEl: document.getElementById('sort-by'),
      timeRangeEl: document.getElementById('time-range'),
      
      // Statistics
      totalTestsEl: document.getElementById('total-tests'),
      averageScoreEl: document.getElementById('average-score'),
      averageScoreEl: document.getElementById('average-score'),
      totalTimeEl: document.getElementById('total-time'),
      
      // Leaderboard list
      leaderboardListEl: document.getElementById('leaderboard-list'),
      emptyStateEl: document.getElementById('empty-state'),
      
      // Achievements
      achievementsGridEl: document.getElementById('achievements-grid'),
      
      // Action buttons
      clearScoresBtnEl: document.getElementById('clear-scores'),
      exportLeaderboardCsvBtnEl: document.getElementById('export-leaderboard-csv'),
      exportLeaderboardJsonBtnEl: document.getElementById('export-leaderboard-json'),
      startFirstTestBtnEl: document.getElementById('start-first-test'),
      
      // Modals
      scoreDetailsModalEl: document.getElementById('score-details-modal'),
      scoreDetailsContentEl: document.getElementById('score-details-content'),
      deleteScoreBtnEl: document.getElementById('delete-score'),
      closeDetailsBtnEl: document.getElementById('close-details'),
      
      clearConfirmationModalEl: document.getElementById('clear-confirmation-modal'),
      cancelClearBtnEl: document.getElementById('cancel-clear'),
      confirmClearBtnEl: document.getElementById('confirm-clear')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter controls
    this.elements.filterModeEl?.addEventListener('change', (e) => {
      this.currentFilters.mode = e.target.value;
      this.applyFilters();
    });

    this.elements.sortByEl?.addEventListener('change', (e) => {
      this.currentFilters.sortBy = e.target.value;
      this.applyFilters();
    });

    this.elements.timeRangeEl?.addEventListener('change', (e) => {
      this.currentFilters.timeRange = e.target.value;
      this.applyFilters();
    });

    // Action buttons
    this.elements.clearScoresBtnEl?.addEventListener('click', () => this.showClearConfirmation());
    this.elements.exportLeaderboardCsvBtnEl?.addEventListener('click', () => this.exportLeaderboard('csv'));
    if (this.elements.exportLeaderboardJsonBtnEl) {
      this.elements.exportLeaderboardJsonBtnEl.style.display = 'none';
    }
    this.elements.startFirstTestBtnEl?.addEventListener('click', () => {
      window.location.href = '../../index.html';
    });

    // Score details modal
    this.elements.deleteScoreBtnEl?.addEventListener('click', () => this.deleteCurrentScore());
    this.elements.closeDetailsBtnEl?.addEventListener('click', () => this.hideScoreDetails());

    // Clear confirmation modal
    this.elements.cancelClearBtnEl?.addEventListener('click', () => this.hideClearConfirmation());
    this.elements.confirmClearBtnEl?.addEventListener('click', () => this.clearAllScores());

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
   * Load leaderboard data
   */
  loadLeaderboard() {
    // Load from both training and exam sessions
    const trainingSessions = Storage.load('trainingSessions', []);
    const examSessions = Storage.load('examSessions', []);
    const savedLeaderboard = Storage.load('leaderboard', []);
    
    // Combine all sessions and convert to leaderboard format
    const allSessions = [...trainingSessions, ...examSessions];
    const sessionLeaderboard = allSessions.map(session => ({
      id: session.id,
      playerName: session.playerName || 'مجهول',
      comment: session.comment || '',
      type: session.type,
      score: session.score,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      totalQuestions: session.totalQuestions,
      totalTime: session.totalTime,
      difficulty: session.difficulty || 'normal',
      timestamp: session.timestamp
    }));
    
    // Combine with manually saved scores
    this.leaderboard = [...savedLeaderboard, ...sessionLeaderboard];
    
    // Remove duplicates based on ID
    this.leaderboard = this.leaderboard.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    this.applyFilters();
    this.updateStatistics();
    this.updateAchievements();
  }

  /**
   * Apply filters to leaderboard
   */
  applyFilters() {
    let filtered = [...this.leaderboard];

    // Filter by mode
    if (this.currentFilters.mode !== 'all') {
      filtered = filtered.filter(score => score.type === this.currentFilters.mode);
    }

    // Filter by time range
    if (this.currentFilters.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      const timeLimit = timeRanges[this.currentFilters.timeRange];
      if (timeLimit) {
        filtered = filtered.filter(score => {
          const scoreDate = new Date(score.timestamp);
          return (now - scoreDate) <= timeLimit;
        });
      }
    }

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (this.currentFilters.sortBy) {
        case 'score':
          return b.score - a.score;
        case 'date':
          return b.timestamp - a.timestamp;
        case 'time':
          return a.totalTime - b.totalTime;
        default:
          return b.score - a.score;
      }
    });

    this.filteredLeaderboard = filtered;
    this.displayLeaderboard();
  }

  /**
   * Display leaderboard
   */
  displayLeaderboard() {
    if (this.filteredLeaderboard.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();
    this.elements.leaderboardListEl.innerHTML = '';

    this.filteredLeaderboard.forEach((score, index) => {
      const scoreEl = this.createScoreElement(score, index);
      this.elements.leaderboardListEl.appendChild(scoreEl);
    });
  }

  /**
   * Create score element
   */
  createScoreElement(score, index) {
    const scoreEl = document.createElement('div');
    scoreEl.className = 'leaderboard-item';
    scoreEl.dataset.scoreId = score.id;

    const rank = index + 1;
    const rankClass = rank <= 3 ? 'top-3' : '';
    const typeText = score.type === 'training' ? 'تدريب' : 'اختبار';
    const dateText = formatDate(score.timestamp);

    scoreEl.innerHTML = `
      <div class="leaderboard-rank ${rankClass}">${rank}</div>
      <div class="leaderboard-info">
        <div class="leaderboard-name">${score.playerName}</div>
        <div class="leaderboard-details">
          <span>${typeText}</span>
          <span>${dateText}</span>
          <span>${score.difficulty || 'عادي'}</span>
        </div>
      </div>
      <div class="leaderboard-score">${score.score}%</div>
    `;

    // Add click event to show details
    scoreEl.addEventListener('click', () => this.showScoreDetails(score));

    return scoreEl;
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    this.elements.leaderboardListEl.style.display = 'none';
    this.elements.emptyStateEl.style.display = 'block';
  }

  /**
   * Hide empty state
   */
  hideEmptyState() {
    this.elements.leaderboardListEl.style.display = 'block';
    this.elements.emptyStateEl.style.display = 'none';
  }

  /**
   * Update statistics
   */
  updateStatistics() {
    const totalTests = this.leaderboard.length;
    const averageScore = totalTests > 0 ? 
      Math.round(this.leaderboard.reduce((sum, score) => sum + score.score, 0) / totalTests) : 0;
    const totalTime = this.leaderboard.reduce((sum, score) => sum + score.totalTime, 0);

    this.elements.totalTestsEl.textContent = totalTests;
    this.elements.averageScoreEl.textContent = `${averageScore}%`;
    this.elements.totalTimeEl.textContent = formatTime(totalTime);
  }

  /**
   * Update achievements
   */
  updateAchievements() {
    if (!this.elements.achievementsGridEl) return;

    const achievements = this.calculateAchievements();
    this.elements.achievementsGridEl.innerHTML = '';

    achievements.forEach(achievement => {
      const achievementEl = this.createAchievementElement(achievement);
      this.elements.achievementsGridEl.appendChild(achievementEl);
    });
  }

  /**
   * Calculate achievements
   */
  calculateAchievements() {
    const achievements = [
      {
        id: 'first_test',
        name: 'البداية',
        description: 'أكمل أول اختبار',
        icon: '🎯',
        earned: this.leaderboard.length > 0
      },
      {
        id: 'perfect_score',
        name: 'مثالي',
        description: 'احصل على 100% في أي اختبار',
        icon: '💯',
        earned: this.leaderboard.some(score => score.score === 100)
      },
      {
        id: 'speed_demon',
        name: 'سريع',
        description: 'أكمل اختبار في أقل من دقيقة',
        icon: '⚡',
        earned: this.leaderboard.some(score => score.totalTime < 60)
      },
      {
        id: 'persistent',
        name: 'مثابر',
        description: 'أكمل 10 اختبارات',
        icon: '🔥',
        earned: this.leaderboard.length >= 10
      },
      {
        id: 'expert',
        name: 'خبير',
        description: 'احصل على متوسط 90% أو أكثر',
        icon: '🏆',
        earned: this.calculateAverageScore() >= 90
      },
      {
        id: 'marathon',
        name: 'ماراثون',
        description: 'أكمل 50 اختبار',
        icon: '🏃',
        earned: this.leaderboard.length >= 50
      }
    ];

    return achievements;
  }

  /**
   * Calculate average score
   */
  calculateAverageScore() {
    if (this.leaderboard.length === 0) return 0;
    return this.leaderboard.reduce((sum, score) => sum + score.score, 0) / this.leaderboard.length;
  }

  /**
   * Create achievement element
   */
  createAchievementElement(achievement) {
    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement-item ${achievement.earned ? 'earned' : ''}`;

    achievementEl.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-description">${achievement.description}</div>
    `;

    return achievementEl;
  }

  /**
   * Show score details modal
   */
  showScoreDetails(score) {
    this.currentScore = score;
    
    const typeText = score.type === 'training' ? 'تدريب' : 'اختبار';
    const dateText = formatDate(score.timestamp);
    const timeText = formatTime(score.totalTime);

    this.elements.scoreDetailsContentEl.innerHTML = `
      <div class="score-detail-section">
        <h3>معلومات اللاعب</h3>
        <p><strong>الاسم:</strong> ${score.playerName}</p>
        <p><strong>التعليق:</strong> ${score.comment || 'لا يوجد تعليق'}</p>
      </div>
      
      <div class="score-detail-section">
        <h3>تفاصيل الاختبار</h3>
        <p><strong>النوع:</strong> ${typeText}</p>
        <p><strong>التاريخ:</strong> ${dateText}</p>
        <p><strong>الصعوبة:</strong> ${score.difficulty || 'عادي'}</p>
        <p><strong>الوقت المستغرق:</strong> ${timeText}</p>
      </div>
      
      <div class="score-detail-section">
        <h3>النتائج</h3>
        <p><strong>النتيجة:</strong> ${score.score}%</p>
        <p><strong>الإجابات الصحيحة:</strong> ${score.correctCount}</p>
        <p><strong>الإجابات الخاطئة:</strong> ${score.wrongCount}</p>
        <p><strong>إجمالي الأسئلة:</strong> ${score.totalQuestions}</p>
      </div>
    `;

    this.elements.scoreDetailsModalEl.classList.add('show');
    this.elements.scoreDetailsModalEl.setAttribute('aria-hidden', 'false');
  }

  /**
   * Hide score details modal
   */
  hideScoreDetails() {
    this.elements.scoreDetailsModalEl.classList.remove('show');
    this.elements.scoreDetailsModalEl.setAttribute('aria-hidden', 'true');
    this.currentScore = null;
  }

  /**
   * Delete current score
   */
  deleteCurrentScore() {
    if (!this.currentScore) return;

    this.leaderboard = this.leaderboard.filter(score => score.id !== this.currentScore.id);
    Storage.save('leaderboard', this.leaderboard);
    
    this.hideScoreDetails();
    this.loadLeaderboard();
    showNotification('تم حذف النتيجة بنجاح', 'success', 3000);
  }

  /**
   * Show clear confirmation modal
   */
  showClearConfirmation() {
    this.elements.clearConfirmationModalEl.classList.add('show');
    this.elements.clearConfirmationModalEl.setAttribute('aria-hidden', 'false');
  }

  /**
   * Hide clear confirmation modal
   */
  hideClearConfirmation() {
    this.elements.clearConfirmationModalEl.classList.remove('show');
    this.elements.clearConfirmationModalEl.setAttribute('aria-hidden', 'true');
  }

  /**
   * Clear all scores
   */
  clearAllScores() {
    Storage.remove('leaderboard');
    this.leaderboard = [];
    this.loadLeaderboard();
    this.hideClearConfirmation();
    showNotification('تم مسح جميع النتائج', 'success', 3000);
  }

  /**
   * Export leaderboard to CSV or JSON
   */
  exportLeaderboard(format = 'csv') {
    if (this.filteredLeaderboard.length === 0) {
      showNotification('لا توجد نتائج للتصدير', 'error', 3000);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let success = false;

    const csvData = this.prepareLeaderboardCSV();
    const filename = `leaderboard_${timestamp}.csv`;
    
    success = exportToCSV(csvData, filename, [
      'Rank',
      'Player Name',
      'Type',
      'Score (%)',
      'Correct Answers',
      'Wrong Answers',
      'Total Questions',
      'Total Time In Minutes (seconds)',
      'Difficulty',
      'Date',
      'Comment'
    ]);

    if (success) {
      showNotification('تم تصدير لوحة النتائج بصيغة CSV بنجاح', 'success', 3000);
    } else {
      showNotification('فشل في تصدير لوحة النتائج', 'error', 3000);
    }
  }

  /**
   * Prepare leaderboard CSV data
   */
  prepareLeaderboardCSV() {
    return this.filteredLeaderboard.map((score, index) => [
      index + 1,
      score.playerName,
      score.type === 'training' ? 'Training' : 'Exam',
      score.score,
      score.correctCount,
      score.wrongCount,
      score.totalQuestions,
      score.totalTime,
      score.difficulty || 'Normal',
      formatDate(score.timestamp),
      score.comment || ''
    ]);
  }

  /**
   * Prepare leaderboard JSON data
   */
  // JSON export removed

  /**
   * Get previous best score
   */
  getPreviousBestScore(results) {
    if (results.length <= 1) return 0;
    return results[1]?.score || 0;
  }

  /**
   * Get previous results
   */
  getPreviousResults() {
    return this.leaderboard.sort((a, b) => b.timestamp - a.timestamp);
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

// Initialize leaderboard controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LeaderboardController();
});