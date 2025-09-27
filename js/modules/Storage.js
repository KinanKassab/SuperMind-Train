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
            localStorage.setItem(this.keys.settings, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
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
            const history = this.getTestHistory();
            const testResult = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...results
            };
            
            history.unshift(testResult);
            
            // Keep only last 50 tests
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem(this.keys.history, JSON.stringify(history));
            this.updateStats(results);
        } catch (error) {
            console.error('Failed to save test results:', error);
        }
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
