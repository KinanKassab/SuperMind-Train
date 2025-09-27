// Main application entry point
import { QuestionGenerator } from './modules/QuestionGenerator.js';
import { Timer } from './modules/Timer.js';
import { Storage } from './modules/Storage.js';
import { SoundManager } from './modules/SoundManager.js';
import { UI } from './modules/UI.js';
import { TestManager } from './modules/TestManager.js';
import { Accessibility } from './modules/Accessibility.js';

class App {
    constructor() {
        this.questionGenerator = new QuestionGenerator();
        this.timer = new Timer();
        this.storage = new Storage();
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.testManager = new TestManager(this);
        this.accessibility = new Accessibility();
        
        this.currentSettings = {
            questionCount: 10,
            timerMode: 'off',
            timerDuration: 30,
            soundEnabled: true,
            language: 'ar',
            testMode: 'practice'
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateQuickStats();
        this.applyTheme();
    }
    
    loadSettings() {
        const savedSettings = this.storage.getSettings();
        if (savedSettings) {
            this.currentSettings = { ...this.currentSettings, ...savedSettings };
        }
        this.ui.updateSettingsUI(this.currentSettings);
    }
    
    saveSettings() {
        this.storage.saveSettings(this.currentSettings);
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.ui.showSettingsModal();
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.ui.hideSettingsModal();
        });
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettingsFromUI();
        });
        
        // Mode selection
        document.getElementById('practice-mode').addEventListener('click', () => {
            this.startTest('practice');
        });
        
        document.getElementById('exam-mode').addEventListener('click', () => {
            this.startTest('exam');
        });
        
        // Test controls
        document.getElementById('next-question').addEventListener('click', () => {
            this.testManager.nextQuestion();
        });
        
        document.getElementById('end-test').addEventListener('click', () => {
            this.testManager.endTest();
        });
        
        // Results actions
        document.getElementById('new-test').addEventListener('click', () => {
            this.ui.showScreen('welcome-screen');
        });
        
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportResults();
        });
        
        document.getElementById('review-answers').addEventListener('click', () => {
            this.showAnswerReview();
        });
        
        // Back to welcome
        document.getElementById('back-to-welcome').addEventListener('click', () => {
            this.ui.showScreen('welcome-screen');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Timer settings visibility
        document.getElementById('timer-mode').addEventListener('change', (e) => {
            this.ui.toggleTimerSettings(e.target.value);
        });
    }
    
    handleKeyboardShortcuts(e) {
        if (this.ui.currentScreen === 'test-screen') {
            // Answer selection with number keys
            if (e.key >= '1' && e.key <= '4') {
                const answerIndex = parseInt(e.key) - 1;
                this.testManager.selectAnswer(answerIndex);
            }
            
            // Enter to confirm/next
            if (e.key === 'Enter') {
                if (this.testManager.canProceed()) {
                    this.testManager.nextQuestion();
                }
            }
            
            // N for next
            if (e.key === 'n' || e.key === 'N') {
                if (this.testManager.canProceed()) {
                    this.testManager.nextQuestion();
                }
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.ui.hideSettingsModal();
        }
    }
    
    saveSettingsFromUI() {
        this.currentSettings = {
            questionCount: parseInt(document.getElementById('question-count').value),
            timerMode: document.getElementById('timer-mode').value,
            timerDuration: parseInt(document.getElementById('timer-duration').value),
            soundEnabled: document.getElementById('sound-enabled').checked,
            language: document.getElementById('language').value,
            testMode: this.currentSettings.testMode
        };
        
        this.saveSettings();
        this.ui.hideSettingsModal();
        this.ui.updateLanguage(this.currentSettings.language);
    }
    
    startTest(mode) {
        this.currentSettings.testMode = mode;
        this.testManager.startTest(this.currentSettings);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.storage.setTheme(newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    applyTheme() {
        const savedTheme = this.storage.getTheme();
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        }
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    updateQuickStats() {
        const stats = this.storage.getStats();
        document.getElementById('total-tests').textContent = stats.totalTests;
        document.getElementById('best-score').textContent = `${stats.bestScore}%`;
    }
    
    exportResults() {
        const results = this.testManager.getCurrentResults();
        if (!results) return;
        
        const csv = this.generateCSV(results);
        this.downloadCSV(csv, `multiplication-test-${new Date().toISOString().split('T')[0]}.csv`);
    }
    
    generateCSV(results) {
        const headers = ['السؤال', 'المعامل الأول', 'المعامل الثاني', 'الإجابة الصحيحة', 'إجابتك', 'النتيجة', 'الوقت المستغرق'];
        const rows = [headers.join(',')];
        
        results.questions.forEach((q, index) => {
            const row = [
                index + 1,
                q.factorA,
                q.factorB,
                q.correctAnswer,
                q.userAnswer || '',
                q.isCorrect ? 'صحيح' : 'خطأ',
                q.timeSpent || 0
            ];
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showAnswerReview() {
        // Implementation for answer review modal
        console.log('Showing answer review...');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
