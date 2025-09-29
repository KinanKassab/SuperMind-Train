// SuperMind Trainer - Utility Functions

/**
 * LocalStorage utility functions
 */
export const Storage = {
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to save
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all localStorage data
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Timer utility class
 */
export class Timer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.remaining = duration;
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.remaining--;
      if (this.onTick) {
        this.onTick(this.remaining);
      }
      
      if (this.remaining <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.remaining = this.duration;
  }

  getRemaining() {
    return this.remaining;
  }

  isActive() {
    return this.isRunning;
  }
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Play sound effect
 * @param {string} soundType - Type of sound ('correct' or 'wrong')
 */
export function playSound(soundType) {
  try {
    const audio = new Audio(`../sounds/${soundType}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.warn('Could not play sound:', error);
    });
  } catch (error) {
    console.warn('Sound file not found:', error);
  }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds
 */
export function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: '10000',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });
  
  // Set background color based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after duration
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

/**
 * Create confetti animation
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of confetti pieces
 */
export function createConfetti(container, count = 50) {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    container.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 5000);
  }
}

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 * @param {Array} headers - CSV headers
 */
export function exportToCSV(data, filename, headers = []) {
  try {
    let csvContent = '';
    
    // Add headers if provided
    if (headers.length > 0) {
      csvContent += headers.join(',') + '\n';
    }
    
    // Add data rows
    data.forEach(row => {
      if (Array.isArray(row)) {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      } else if (typeof row === 'object') {
        const values = Object.values(row).map(value => `"${value}"`);
        csvContent += values.join(',') + '\n';
      }
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
}

/**
 * Export data to JSON file
 * @param {Array|Object} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 * @returns {boolean} True if successful
 */
export function exportToJSON(data, filename) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return false;
  }
}

/**
 * Get current date and time in ISO format
 * @returns {string} ISO date string
 */
export function getCurrentDateTime() {
  return new Date().toISOString();
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'ar-SA') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Get device type
 * @returns {string} Device type ('mobile', 'tablet', 'desktop')
 */
export function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Check if device supports touch
 * @returns {boolean} True if touch supported
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} element - Element or selector
 * @param {number} offset - Offset from top
 */
export function smoothScrollTo(element, offset = 0) {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (target) {
    const targetPosition = target.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Get query parameters from URL
 * @returns {Object} Query parameters object
 */
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Set query parameters in URL
 * @param {Object} params - Parameters to set
 * @param {boolean} replace - Whether to replace current history entry
 */
export function setQueryParams(params, replace = false) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
}

/**
 * Language and theme utilities
 */
export const Language = {
  current: 'ar',
  
  setLanguage(lang) {
    this.current = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    Storage.save('language', lang);
    this.updateTexts();
    this.updatePlaceholders();
    this.updateLogoText();
    this.updateBackButtonIcon();
  },
  
  updateTexts() {
    const elements = document.querySelectorAll('[data-ar][data-en]');
    elements.forEach(element => {
      const text = element.getAttribute(`data-${this.current}`);
      if (text) {
        if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
          element.textContent = text;
        }
      }
    });
  },
  
  updatePlaceholders() {
    const elements = document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]');
    elements.forEach(element => {
      const placeholder = element.getAttribute(`data-placeholder-${this.current}`);
      if (placeholder && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        element.placeholder = placeholder;
      }
    });
  },
  
  updateLogoText() {
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
      const text = logoText.getAttribute(`data-${this.current}`);
      if (text) {
        logoText.textContent = text;
      }
    }
  },
  
  updateBackButtonIcon() {
    const backBtns = document.querySelectorAll('#back-btn .back-icon');
    backBtns.forEach(btn => {
      // Set icon based on language
      if (this.current === 'ar') {
        btn.style.backgroundImage = "url('../icons/RightArrow.png')";
      } else {
        btn.style.backgroundImage = "url('../icons/LeftArrow.png')";
      }
    });
    
    // Also update via global function
    if (typeof updateBackButtonIcons === 'function') {
      updateBackButtonIcons();
    }
  },
  
  getText(key) {
    const translations = {
      ar: {
        correct: 'صحيح',
        wrong: 'خطأ',
        time: 'الوقت',
        score: 'النتيجة',
        question: 'سؤال',
        of: 'من',
        next: 'التالي',
        submit: 'تأكيد',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        close: 'إغلاق',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تم بنجاح'
      },
      en: {
        correct: 'Correct',
        wrong: 'Wrong',
        time: 'Time',
        score: 'Score',
        question: 'Question',
        of: 'of',
        next: 'Next',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        close: 'Close',
        loading: 'Loading...',
        error: 'Error occurred',
        success: 'Success'
      }
    };
    
    return translations[this.current]?.[key] || key;
  }
};

export const Theme = {
  current: 'light',
  
  setTheme(theme) {
    this.current = theme;
    document.body.className = `${theme}-theme`;
    Storage.save('theme', theme);
    this.updateThemeIcon();
  },
  
  toggle() {
    const newTheme = this.current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },
  
  updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = this.current === 'light' ? '🌙' : '☀️';
    }
  }
};

// Initialize theme and language on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = Storage.load('theme', 'light');
  const savedLanguage = Storage.load('language', 'ar');
  
  Theme.setTheme(savedTheme);
  Language.setLanguage(savedLanguage);
  
  // Initialize back button icons
  setTimeout(() => {
    Language.updateBackButtonIcon();
  }, 100);
  
  // Update language toggle icon
  const langToggle = document.getElementById('language-toggle');
  if (langToggle) {
    const icon = langToggle.querySelector('.lang-icon');
    if (icon) {
      icon.textContent = savedLanguage === 'ar' ? 'EN' : 'ع';
    }
  }
});
