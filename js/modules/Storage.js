/**
 * Storage Module
 * Handles localStorage operations for settings, stats, and test history
 */
export class Storage {
    constructor() {
        this.keys = {
            settings: 'multiplication_trainer_settings',
            stats: 'multiplication_trainer_stats',
            history: 'multiplication_trainer_history',
            leaderboard: 'multiplication_trainer_leaderboard',
            theme: 'multiplication_trainer_theme'
        };
    }
    
    /**
     * Save settings to localStorage
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            // Validate settings before saving
            const validatedSettings = this.validateSettings(settings);
            localStorage.setItem(this.keys.settings, JSON.stringify(validatedSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw new Error('فشل في حفظ الإعدادات');
        }
    }
    
    /**
     * Validate settings object
     * @param {Object} settings - Settings to validate
     * @returns {Object} Validated settings
     */
    validateSettings(settings) {
        const defaults = {
            questionCount: 10,
            timerMode: 'off',
            timerDuration: 30,
            soundEnabled: true,
            language: 'ar',
            testMode: 'practice'
        };
        
        const validated = { ...defaults };
        
        // Validate question count
        if (typeof settings.questionCount === 'number' && 
            settings.questionCount >= 1 && settings.questionCount <= 50) {
            validated.questionCount = settings.questionCount;
        }
        
        // Validate timer mode
        if (typeof settings.timerMode === 'string' && 
            ['off', 'per-question', 'total-time'].includes(settings.timerMode)) {
            validated.timerMode = settings.timerMode;
        }
        
        // Validate timer duration
        if (typeof settings.timerDuration === 'number' && 
            settings.timerDuration >= 5 && settings.timerDuration <= 300) {
            validated.timerDuration = settings.timerDuration;
        }
        
        // Validate sound enabled
        if (typeof settings.soundEnabled === 'boolean') {
            validated.soundEnabled = settings.soundEnabled;
        }
        
        // Validate language
        if (typeof settings.language === 'string' && 
            ['ar', 'en'].includes(settings.language)) {
            validated.language = settings.language;
        }
        
        // Validate test mode
        if (typeof settings.testMode === 'string' && 
            ['practice', 'exam'].includes(settings.testMode)) {
            validated.testMode = settings.testMode;
        }
        
        return validated;
    }
    
    /**
     * Get settings from localStorage
     * @returns {Object|null} Settings object or null
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.keys.settings);
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return null;
        }
    }
    
    /**
     * Save test results to history
     * @param {Object} results - Test results object
     */
    saveTestResults(results) {
        try {
            // Validate results before saving
            const validatedResults = this.validateTestResults(results);
            
            const history = this.getTestHistory();
            const testResult = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...validatedResults
            };
            
            history.unshift(testResult);
            
            // Keep only last 50 tests
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem(this.keys.history, JSON.stringify(history));
            this.updateStats(validatedResults);
        } catch (error) {
            console.error('Failed to save test results:', error);
            throw new Error('فشل في حفظ نتائج الاختبار');
        }
    }
    
    /**
     * Validate test results object
     * @param {Object} results - Test results to validate
     * @returns {Object} Validated results
     */
    validateTestResults(results) {
        if (!results || typeof results !== 'object') {
            throw new Error('نتائج الاختبار غير صحيحة');
        }
        
        const validated = {};
        
        // Validate required fields
        if (typeof results.totalQuestions === 'number' && results.totalQuestions > 0) {
            validated.totalQuestions = results.totalQuestions;
        } else {
            throw new Error('عدد الأسئلة غير صحيح');
        }
        
        if (typeof results.correctCount === 'number' && results.correctCount >= 0) {
            validated.correctCount = results.correctCount;
        } else {
            throw new Error('عدد الإجابات الصحيحة غير صحيح');
        }
        
        if (typeof results.incorrectCount === 'number' && results.incorrectCount >= 0) {
            validated.incorrectCount = results.incorrectCount;
        } else {
            validated.incorrectCount = validated.totalQuestions - validated.correctCount;
        }
        
        if (typeof results.scorePercentage === 'number' && 
            results.scorePercentage >= 0 && results.scorePercentage <= 100) {
            validated.scorePercentage = results.scorePercentage;
        } else {
            validated.scorePercentage = Math.round((validated.correctCount / validated.totalQuestions) * 100);
        }
        
        if (typeof results.totalTime === 'number' && results.totalTime >= 0) {
            validated.totalTime = results.totalTime;
        } else {
            validated.totalTime = 0;
        }
        
        // Copy other valid fields
        if (results.questions && Array.isArray(results.questions)) {
            validated.questions = results.questions;
        }
        
        if (results.userAnswers && Array.isArray(results.userAnswers)) {
            validated.userAnswers = results.userAnswers;
        }
        
        if (results.settings && typeof results.settings === 'object') {
            validated.settings = results.settings;
        }
        
        return validated;
    }
    
    /**
     * Get test history
     * @returns {Array} Array of test results
     */
    getTestHistory() {
        try {
            const history = localStorage.getItem(this.keys.history);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load test history:', error);
            return [];
        }
    }
    
    /**
     * Update statistics
     * @param {Object} results - Test results object
     */
    updateStats(results) {
        try {
            const stats = this.getStats();
            const newStats = {
                totalTests: stats.totalTests + 1,
                totalQuestions: stats.totalQuestions + results.totalQuestions,
                correctAnswers: stats.correctAnswers + results.correctCount,
                bestScore: Math.max(stats.bestScore, results.scorePercentage),
                averageScore: this.calculateAverageScore(stats, results),
                totalTime: stats.totalTime + results.totalTime,
                lastTestDate: new Date().toISOString()
            };
            
            localStorage.setItem(this.keys.stats, JSON.stringify(newStats));
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }
    
    /**
     * Calculate average score
     * @param {Object} currentStats - Current statistics
     * @param {Object} newResults - New test results
     * @returns {number} New average score
     */
    calculateAverageScore(currentStats, newResults) {
        const totalScore = (currentStats.averageScore * currentStats.totalTests) + newResults.scorePercentage;
        return Math.round(totalScore / (currentStats.totalTests + 1));
    }
    
    /**
     * Get statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        try {
            const stats = localStorage.getItem(this.keys.stats);
            const defaultStats = {
                totalTests: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                bestScore: 0,
                averageScore: 0,
                totalTime: 0,
                lastTestDate: null
            };
            
            return stats ? JSON.parse(stats) : defaultStats;
        } catch (error) {
            console.error('Failed to load stats:', error);
            return {
                totalTests: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                bestScore: 0,
                averageScore: 0,
                totalTime: 0,
                lastTestDate: null
            };
        }
    }
    
    /**
     * Add entry to leaderboard
     * @param {string} name - Player name
     * @param {number} score - Score percentage
     * @param {number} time - Time taken
     */
    addToLeaderboard(name, score, time) {
        try {
            const leaderboard = this.getLeaderboard();
            const entry = {
                id: Date.now(),
                name,
                score,
                time,
                date: new Date().toISOString()
            };
            
            leaderboard.push(entry);
            
            // Sort by score (descending) then by time (ascending)
            leaderboard.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.time - b.time;
            });
            
            // Keep only top 20 entries
            if (leaderboard.length > 20) {
                leaderboard.splice(20);
            }
            
            localStorage.setItem(this.keys.leaderboard, JSON.stringify(leaderboard));
        } catch (error) {
            console.error('Failed to add to leaderboard:', error);
        }
    }
    
    /**
     * Get leaderboard
     * @returns {Array} Leaderboard entries
     */
    getLeaderboard() {
        try {
            const leaderboard = localStorage.getItem(this.keys.leaderboard);
            return leaderboard ? JSON.parse(leaderboard) : [];
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    }
    
    /**
     * Save theme preference
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        try {
            localStorage.setItem(this.keys.theme, theme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }
    
    /**
     * Get theme preference
     * @returns {string} Theme name
     */
    getTheme() {
        try {
            return localStorage.getItem(this.keys.theme) || 'light';
        } catch (error) {
            console.error('Failed to load theme:', error);
            return 'light';
        }
    }
    
    /**
     * Clear all data
     */
    clearAllData() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Failed to clear data:', error);
        }
    }
    
    /**
     * Export data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        try {
            const data = {
                settings: this.getSettings(),
                stats: this.getStats(),
                history: this.getTestHistory(),
                leaderboard: this.getLeaderboard(),
                theme: this.getTheme(),
                exportDate: new Date().toISOString()
            };
            
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }
    
    /**
     * Import data from JSON
     * @param {string} jsonData - JSON string of data
     * @returns {boolean} True if successful
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.settings) {
                localStorage.setItem(this.keys.settings, JSON.stringify(data.settings));
            }
            if (data.stats) {
                localStorage.setItem(this.keys.stats, JSON.stringify(data.stats));
            }
            if (data.history) {
                localStorage.setItem(this.keys.history, JSON.stringify(data.history));
            }
            if (data.leaderboard) {
                localStorage.setItem(this.keys.leaderboard, JSON.stringify(data.leaderboard));
            }
            if (data.theme) {
                localStorage.setItem(this.keys.theme, data.theme);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}
