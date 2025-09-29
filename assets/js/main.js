// SuperMind Trainer - Main Page Controller

import { Storage, showNotification } from './utils.js';

/**
 * Main Page Controller
 */
export class MainController {
  constructor() {
    this.settings = this.loadSettings();
    this.initializeElements();
    this.bindEvents();
    this.updateQuickStats();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.elements = {
      // Mode buttons
      modeBtns: document.querySelectorAll('.mode-btn'),
      
      // Settings modal
      settingsModal: document.getElementById('settings-modal'),
      settingsForm: document.getElementById('settings-form'),
      questionCountSelect: document.getElementById('question-count'),
      timerModeSelect: document.getElementById('timer-mode'),
      timerDurationGroup: document.getElementById('timer-duration-group'),
      timerDurationInput: document.getElementById('timer-duration'),
      soundEnabledCheckbox: document.getElementById('sound-enabled'),
      // Difficulty
      difficultySelect: document.getElementById('difficulty'),
      multiplicationRuleSelect: document.getElementById('multiplication-rule'),
      cancelSettingsBtn: document.getElementById('cancel-settings'),
      startTestBtn: document.getElementById('start-test'),
      
      // Quick stats
      totalQuestionsEl: document.getElementById('total-questions'),
      averageScoreEl: document.getElementById('average-score'),
      totalTimeEl: document.getElementById('total-time'),
      
      // Theme and language controls
      themeToggle: document.getElementById('theme-toggle'),
      languageToggle: document.getElementById('language-toggle')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Mode selection buttons
    this.elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.handleModeSelection(mode);
      });
    });

    // Settings modal
    this.elements.timerModeSelect?.addEventListener('change', (e) => {
      this.toggleTimerDurationGroup(e.target.value);
    });

    this.elements.cancelSettingsBtn?.addEventListener('click', () => {
      this.hideSettingsModal();
    });

    this.elements.startTestBtn?.addEventListener('click', () => {
      this.startTest();
    });

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

    // Theme toggle
    this.elements.themeToggle?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Language toggle
    this.elements.languageToggle?.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideSettingsModal();
      }
    });
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const defaultSettings = {
      questionCount: 10,
      timerMode: 'per-question',
      timerDuration: 30,
      soundEnabled: true,
      difficulty: 'medium'
    };

    return Storage.load('appSettings', defaultSettings);
  }

  /**
   * Handle mode selection
   */
  handleModeSelection(mode) {
    switch (mode) {
      case 'training':
        this.showSettingsModal('training');
        break;
      case 'exam':
        this.showSettingsModal('exam');
        break;
      case 'leaderboard':
        window.location.href = 'assets/html/leaderboard.html';
        break;
    }
  }

  /**
   * Show settings modal
   */
  showSettingsModal(testType) {
    this.currentTestType = testType;
    this.populateSettingsForm();
    
    // Hide timer options for training mode
    const timerGroup = document.querySelector('.form-group:has(#timer-mode)');
    const timerDurationGroup = this.elements.timerDurationGroup;
    
    if (testType === 'training') {
      if (timerGroup) timerGroup.style.display = 'none';
      if (timerDurationGroup) timerDurationGroup.style.display = 'none';
    } else {
      if (timerGroup) timerGroup.style.display = 'block';
      this.toggleTimerDurationGroup(this.settings.timerMode);
    }
    
    this.elements.settingsModal.classList.add('show');
    this.elements.settingsModal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    this.elements.questionCountSelect?.focus();
  }

  /**
   * Hide settings modal
   */
  hideSettingsModal() {
    this.elements.settingsModal.classList.remove('show');
    this.elements.settingsModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Populate settings form with current values
   */
  populateSettingsForm() {
    if (!this.elements.settingsForm) return;

    this.elements.questionCountSelect.value = this.settings.questionCount;
    this.elements.timerModeSelect.value = this.settings.timerMode;
    this.elements.timerDurationInput.value = this.settings.timerDuration;
    this.elements.soundEnabledCheckbox.checked = this.settings.soundEnabled;
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.value = this.settings.difficulty;
    }
    if (this.elements.multiplicationRuleSelect) {
      this.elements.multiplicationRuleSelect.value = this.settings.multiplicationRule || 'random';
    }

    this.toggleTimerDurationGroup(this.settings.timerMode);
  }

  /**
   * Toggle timer duration group visibility
   */
  toggleTimerDurationGroup(timerMode) {
    if (this.elements.timerDurationGroup) {
      this.elements.timerDurationGroup.style.display = 'block';
    }
  }

  /**
   * Start test with current settings
   */
  startTest() {
    // Collect form data
    const formData = new FormData(this.elements.settingsForm);
    const settings = {
      questionCount: parseInt(formData.get('questionCount')),
      timerMode: formData.get('timerMode'),
      timerDuration: parseInt(formData.get('timerDuration')),
      soundEnabled: formData.has('soundEnabled'),
      difficulty: (formData.get('difficulty') || 'medium').toLowerCase(),
      multiplicationRule: (formData.get('multiplicationRule') || 'random')
    };

    // Validate settings
    if (settings.questionCount < 1 || settings.questionCount > 100) {
      showNotification('عدد الأسئلة يجب أن يكون بين 1 و 100', 'error', 3000);
      return;
    }

    if (settings.timerDuration < 5 || settings.timerDuration > 300) {
      showNotification('مدة المؤقت يجب أن تكون بين 5 و 300 ثانية', 'error', 3000);
      return;
    }

    // Save settings
    this.settings = { ...this.settings, ...settings };
    Storage.save('appSettings', this.settings);
    Storage.save(`${this.currentTestType}Settings`, settings);

    // Hide modal
    this.hideSettingsModal();

    // Navigate to appropriate page
    const page = this.currentTestType === 'training' ? 'training.html' : 'exam.html';
    window.location.href = page.startsWith('assets/html/') ? page : `assets/html/${page}`;
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.className = `${newTheme}-theme`;
    Storage.save('theme', newTheme);
    this.updateThemeIcon();
  }

  /**
   * Toggle language
   */
  toggleLanguage() {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    
    // Use the Language utility from utils.js
    if (window.Language) {
      window.Language.setLanguage(newLang);
    } else {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      Storage.save('language', newLang);
      this.updateTexts();
    }
    this.updateLanguageIcon();
  }

  /**
   * Update theme icon
   */
  updateThemeIcon() {
    const icon = this.elements.themeToggle?.querySelector('.theme-icon');
    if (icon) {
      const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
  }

  /**
   * Update language icon
   */
  updateLanguageIcon() {
    const icon = this.elements.languageToggle?.querySelector('.lang-icon');
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
    
    // Special handling for logo text
    this.updateLogoText(currentLang);
  }

  /**
   * Update logo text based on language
   */
  updateLogoText(lang) {
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
      const text = logoText.getAttribute(`data-${lang}`);
      if (text) {
        logoText.textContent = text;
      }
    }
  }

  /**
   * Get current page type for logo text
   */
  getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('training.html')) return 'training';
    if (path.includes('exam.html')) return 'exam';
    if (path.includes('results.html')) return 'results';
    if (path.includes('leaderboard.html')) return 'leaderboard';
    return 'index'; // Default to index page
  }

  /**
   * Update quick stats display
   */
  updateQuickStats() {
    // Load all sessions to calculate accurate stats
    const trainingSessions = Storage.load('trainingSessions', []);
    const examSessions = Storage.load('examSessions', []);
    const allSessions = [...trainingSessions, ...examSessions];
    
    const totalQuestions = allSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const averageScore = allSessions.length > 0 ? Math.round(allSessions.reduce((sum, s) => sum + (s.score || 0), 0) / allSessions.length) : 0;
    const totalTime = allSessions.reduce((sum, session) => sum + session.totalTime, 0);
    
    const stats = {
      totalQuestions: 0,
      averageScore: 0,
      totalTime: 0
    };
    
    // Update with calculated values
    stats.totalQuestions = totalQuestions;
    stats.averageScore = averageScore;
    stats.totalTime = totalTime;
    
    // Save updated stats
    Storage.save('quickStats', stats);

    if (this.elements.totalQuestionsEl) {
      this.elements.totalQuestionsEl.textContent = stats.totalQuestions;
    }

    if (this.elements.averageScoreEl) {
      this.elements.averageScoreEl.textContent = `${stats.averageScore}%`;
    }

    if (this.elements.totalTimeEl) {
      this.elements.totalTimeEl.textContent = this.formatTime(stats.totalTime);
    }
  }

  /**
   * Format time in hours:minutes format
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}: ${minutes}`;
    } else {
      return `${minutes}`;
    }
  }
}

// Initialize main controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MainController();
});
