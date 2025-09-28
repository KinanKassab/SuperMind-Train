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
      showHintsCheckbox: document.getElementById('show-hints'),
      cancelSettingsBtn: document.getElementById('cancel-settings'),
      startTestBtn: document.getElementById('start-test'),
      
      // Quick stats
      totalQuestionsEl: document.getElementById('total-questions'),
      bestScoreEl: document.getElementById('best-score'),
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
      timerMode: 'off',
      timerDuration: 30,
      soundEnabled: true,
      showHints: false,
      difficulty: 'normal'
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
        window.location.href = 'leaderboard.html';
        break;
    }
  }

  /**
   * Show settings modal
   */
  showSettingsModal(testType) {
    this.currentTestType = testType;
    this.populateSettingsForm();
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
    this.elements.showHintsCheckbox.checked = this.settings.showHints;

    this.toggleTimerDurationGroup(this.settings.timerMode);
  }

  /**
   * Toggle timer duration group visibility
   */
  toggleTimerDurationGroup(timerMode) {
    if (this.elements.timerDurationGroup) {
      this.elements.timerDurationGroup.style.display = 
        (timerMode === 'per-question' || timerMode === 'total-time') ? 'block' : 'none';
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
      showHints: formData.has('showHints'),
      difficulty: 'normal'
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
    window.location.href = page;
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
    
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    Storage.save('language', newLang);
    this.updateLanguageIcon();
    this.updateTexts();
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
      icon.textContent = currentLang === 'ar' ? '🇺🇸' : '🇸🇦';
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
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = text;
        } else {
          element.textContent = text;
        }
      }
    });
  }

  /**
   * Update quick stats display
   */
  updateQuickStats() {
    const stats = Storage.load('quickStats', {
      totalQuestions: 0,
      bestScore: 0,
      totalTime: 0
    });

    if (this.elements.totalQuestionsEl) {
      this.elements.totalQuestionsEl.textContent = stats.totalQuestions;
    }

    if (this.elements.bestScoreEl) {
      this.elements.bestScoreEl.textContent = `${stats.bestScore}%`;
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
      return `${hours}س ${minutes}د`;
    } else {
      return `${minutes}د`;
    }
  }
}

// Initialize main controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MainController();
});
