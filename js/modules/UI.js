/**
 * UI Module
 * Handles user interface interactions and updates
 */
export class UI {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.language = 'ar';
        this.translations = {
            ar: {
                startTest: 'ابدأ الاختبار',
                testSettings: 'إعدادات الاختبار',
                numberOfQuestions: 'عدد الأسئلة',
                practiceMode: 'وضع الممارسة',
                examMode: 'وضع الاختبار',
                totalTime: 'الزمن الكلي',
                timePerQuestion: 'زمن للسؤال',
                next: 'التالي',
                reviewAnswers: 'راجع الإجابات',
                saveResult: 'حفظ النتيجة',
                exportCSV: 'تصدير CSV',
                leaderboard: 'لوحة النتائج',
                correct: 'صحيح',
                incorrect: 'خطأ',
                timeUp: 'انتهى الوقت',
                perfectScore: 'نتيجة مثالية!',
                goodJob: 'عمل رائع!',
                keepPracticing: 'استمر في التدريب',
                question: 'سؤال',
                of: 'من',
                score: 'النتيجة',
                time: 'الوقت',
                correctAnswers: 'الإجابات الصحيحة',
                incorrectAnswers: 'الإجابات الخاطئة',
                totalTime: 'الوقت الإجمالي',
                newTest: 'اختبار جديد',
                backToHome: 'العودة للرئيسية'
            },
            en: {
                startTest: 'Start Test',
                testSettings: 'Test Settings',
                numberOfQuestions: 'Number of Questions',
                practiceMode: 'Practice Mode',
                examMode: 'Exam Mode',
                totalTime: 'Total Time',
                timePerQuestion: 'Time per Question',
                next: 'Next',
                reviewAnswers: 'Review Answers',
                saveResult: 'Save Result',
                exportCSV: 'Export CSV',
                leaderboard: 'Leaderboard',
                correct: 'Correct',
                incorrect: 'Incorrect',
                timeUp: 'Time\'s Up',
                perfectScore: 'Perfect Score!',
                goodJob: 'Good Job!',
                keepPracticing: 'Keep Practicing',
                question: 'Question',
                of: 'of',
                score: 'Score',
                time: 'Time',
                correctAnswers: 'Correct Answers',
                incorrectAnswers: 'Incorrect Answers',
                totalTime: 'Total Time',
                newTest: 'New Test',
                backToHome: 'Back to Home'
            }
        };
    }
    
    /**
     * Show a specific screen
     * @param {string} screenId - Screen ID to show
     */
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }
    
    /**
     * Show settings modal
     */
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Hide settings modal
     */
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Update settings UI with current settings
     * @param {Object} settings - Settings object
     */
    updateSettingsUI(settings) {
        document.getElementById('question-count').value = settings.questionCount;
        document.getElementById('timer-mode').value = settings.timerMode;
        document.getElementById('timer-duration').value = settings.timerDuration;
        document.getElementById('sound-enabled').checked = settings.soundEnabled;
        document.getElementById('language').value = settings.language;
        
        this.toggleTimerSettings(settings.timerMode);
    }
    
    /**
     * Toggle timer settings visibility
     * @param {string} timerMode - Timer mode
     */
    toggleTimerSettings(timerMode) {
        const timerSettings = document.getElementById('timer-settings');
        if (timerSettings) {
            timerSettings.style.display = timerMode === 'off' ? 'none' : 'block';
        }
    }
    
    /**
     * Update language
     * @param {string} language - Language code
     */
    updateLanguage(language) {
        this.language = language;
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        
        // Update UI text based on language
        this.updateUIText();
    }
    
    /**
     * Update UI text based on current language
     */
    updateUIText() {
        const t = this.translations[this.language];
        
        // Update button texts
        const elements = {
            'start-test': t.startTest,
            'test-settings': t.testSettings,
            'practice-mode': t.practiceMode,
            'exam-mode': t.examMode,
            'next': t.next,
            'review-answers': t.reviewAnswers,
            'export-csv': t.exportCSV,
            'new-test': t.newTest,
            'back-to-home': t.backToHome
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }
    
    /**
     * Update question display
     * @param {Object} question - Question object
     * @param {number} questionNumber - Current question number
     * @param {number} totalQuestions - Total questions
     */
    updateQuestion(question, questionNumber, totalQuestions) {
        document.getElementById('question-text').textContent = question.questionText;
        document.getElementById('question-counter').textContent = 
            `${this.translations[this.language].question} ${questionNumber} ${this.translations[this.language].of} ${totalQuestions}`;
        
        // Update answer buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            // Remove any existing event listeners by cloning
            const newBtn = btn.cloneNode(true);
            newBtn.textContent = question.answers[index];
            newBtn.className = 'answer-btn'; // Reset to default class
            newBtn.disabled = false;
            newBtn.setAttribute('data-answer', question.answers[index]);
            newBtn.setAttribute('aria-label', `الإجابة ${index + 1}: ${question.answers[index]}`);
            newBtn.setAttribute('role', 'button');
            newBtn.setAttribute('tabindex', '0');
            newBtn.setAttribute('type', 'button');
            newBtn.setAttribute('id', `answer-${index}`);
            newBtn.setAttribute('data-index', index);
            newBtn.setAttribute('data-question', questionNumber);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Reset next button
        document.getElementById('next-question').disabled = true;
    }
    
    /**
     * Update progress bar
     * @param {number} current - Current question number
     * @param {number} total - Total questions
     */
    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', Math.round(percentage));
        }
    }
    
    /**
     * Update timer display
     * @param {number} seconds - Remaining seconds
     */
    updateTimer(seconds) {
        const timerText = document.getElementById('timer-text');
        const timerDisplay = document.getElementById('timer-display');
        if (timerText) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            // Add warning class when time is low
            if (seconds <= 10) {
                timerText.classList.add('warning');
                if (timerDisplay) {
                    timerDisplay.classList.add('warning');
                }
            } else {
                timerText.classList.remove('warning');
                if (timerDisplay) {
                    timerDisplay.classList.remove('warning');
                }
            }
        }
    }
    
    /**
     * Show answer selection (highlight selected answer)
     * @param {number} selectedIndex - Index of selected answer
     */
    showAnswerSelection(selectedIndex) {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach((btn, index) => {
            // Remove previous selection
            btn.classList.remove('selected');
            
            // Add selection to clicked button
            if (index === selectedIndex) {
                btn.classList.add('selected');
                btn.setAttribute('aria-label', `الإجابة المختارة: ${btn.textContent}`);
            } else {
                btn.setAttribute('aria-label', `الإجابة ${index + 1}: ${btn.textContent}`);
            }
        });
    }
    
    /**
     * Update results screen
     * @param {Object} results - Test results
     */
    updateResults(results) {
        const scorePercentage = Math.round((results.correctCount / results.totalQuestions) * 100);
        
        document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
        document.getElementById('correct-count').textContent = results.correctCount;
        document.getElementById('incorrect-count').textContent = results.incorrectCount;
        document.getElementById('total-time').textContent = this.formatTime(results.totalTime);
        
        // Update score description
        const scoreDescription = document.getElementById('score-description');
        const t = this.translations[this.language];
        
        let description = '';
        if (scorePercentage === 100) {
            description = t.perfectScore;
        } else if (scorePercentage >= 80) {
            description = t.goodJob;
        } else {
            description = t.keepPracticing;
        }
        
        scoreDescription.textContent = description;
    }
    
    /**
     * Update leaderboard
     * @param {Array} leaderboard - Leaderboard entries
     */
    updateLeaderboard(leaderboard) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>لا توجد نتائج بعد</p>';
            return;
        }
        
        leaderboardList.innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-entry">
                <span class="entry-rank">${index + 1}</span>
                <span class="entry-name">${entry.name}</span>
                <span class="entry-score">${entry.score}%</span>
                <span class="entry-date">${new Date(entry.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }
    
    /**
     * Show confetti animation
     */
    showConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }
    }
    
    /**
     * Create confetti particle
     */
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = this.getRandomColor();
        confetti.style.animationDelay = Math.random() * 3 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
    
    /**
     * Get random color for confetti
     * @returns {string} Random color
     */
    getRandomColor() {
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification based on type
        const colors = {
            success: { bg: '#10b981', color: 'white' },
            error: { bg: '#ef4444', color: 'white' },
            info: { bg: 'var(--bg-secondary)', color: 'var(--text-primary)' },
            warning: { bg: '#f59e0b', color: 'white' }
        };
        
        const colorScheme = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colorScheme.bg};
            color: ${colorScheme.color};
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            border-left: 4px solid ${colorScheme.bg};
        `;
        
        document.body.appendChild(notification);
        
        // Remove after appropriate time based on type
        const duration = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    /**
     * Get translation
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        return this.translations[this.language][key] || key;
    }
    
    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message = 'جاري التحميل...') {
        const loading = document.createElement('div');
        loading.id = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(loading);
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.remove();
        }
    }
    
    /**
     * Show progress indicator
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    showProgress(progress, message = '') {
        let progressBar = document.getElementById('progress-indicator');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'progress-indicator';
            progressBar.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text"></div>
                </div>
            `;
            
            progressBar.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-primary);
                padding: 2rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 1500;
                min-width: 300px;
            `;
            
            document.body.appendChild(progressBar);
        }
        
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressText = progressBar.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }
    
    /**
     * Hide progress indicator
     */
    hideProgress() {
        const progressBar = document.getElementById('progress-indicator');
        if (progressBar) {
            progressBar.remove();
        }
    }
}
