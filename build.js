#!/usr/bin/env node

/**
 * Simple build script for SuperMind-Train
 * Handles minification and optimization
 */

const fs = require('fs');
const path = require('path');

class BuildTool {
    constructor() {
        this.sourceDir = './js';
        this.outputDir = './dist';
        this.files = [];
    }
    
    /**
     * Minify JavaScript code (basic implementation)
     * @param {string} code - JavaScript code
     * @returns {string} Minified code
     */
    minifyJS(code) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\s*([{}();,=])\s*/g, '$1') // Remove spaces around operators
            .trim();
    }
    
    /**
     * Minify CSS code (basic implementation)
     * @param {string} code - CSS code
     * @returns {string} Minified CSS
     */
    minifyCSS(code) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around operators
            .trim();
    }
    
    /**
     * Bundle JavaScript modules
     */
    async bundleJS() {
        console.log('📦 Bundling JavaScript modules...');
        
        const modules = [
            'modules/QuestionGenerator.js',
            'modules/Timer.js',
            'modules/Storage.js',
            'modules/SoundManager.js',
            'modules/UI.js',
            'modules/TestManager.js',
            'modules/Accessibility.js'
        ];
        
        let bundledCode = '';
        
        for (const module of modules) {
            const filePath = path.join(this.sourceDir, module);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                bundledCode += `\n// ${module}\n${content}\n`;
            }
        }
        
        // Add main app code
        const appPath = path.join(this.sourceDir, 'app.js');
        if (fs.existsSync(appPath)) {
            const appContent = fs.readFileSync(appPath, 'utf8');
            bundledCode += `\n// app.js\n${appContent}\n`;
        }
        
        // Create output directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        // Write bundled file
        const outputPath = path.join(this.outputDir, 'app.bundle.js');
        fs.writeFileSync(outputPath, bundledCode);
        
        console.log(`✅ JavaScript bundled: ${outputPath}`);
        return outputPath;
    }
    
    /**
     * Minify CSS
     */
    async minifyCSS() {
        console.log('🎨 Minifying CSS...');
        
        const cssPath = './styles/main.css';
        if (fs.existsSync(cssPath)) {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            const minifiedCSS = this.minifyCSS(cssContent);
            
            const outputPath = path.join(this.outputDir, 'main.min.css');
            fs.writeFileSync(outputPath, minifiedCSS);
            
            console.log(`✅ CSS minified: ${outputPath}`);
            return outputPath;
        }
        
        return null;
    }
    
    /**
     * Create optimized HTML
     */
    async createOptimizedHTML() {
        console.log('📄 Creating optimized HTML...');
        
        const htmlTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SuperMind-Train - تدريب سوبر مايند: تطبيق ويب متكامل لتدريب الطلاب على جدول الضرب مع واجهة عربية ودعم RTL">
    <meta name="keywords" content="multiplication, math, education, arabic, RTL, training, quiz, accessibility">
    <meta name="author" content="SuperMind-Train">
    <meta name="robots" content="index, follow">
    <title>SuperMind-Train - تدريب سوبر مايند</title>
    <link rel="stylesheet" href="main.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <h1 class="logo">SuperMind-Train</h1>
            <div class="header-controls">
                <button id="theme-toggle" class="btn btn-icon" aria-label="تبديل الوضع المظلم">
                    <span class="theme-icon">🌙</span>
                </button>
                <button id="settings-btn" class="btn btn-secondary">إعدادات</button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <!-- Welcome Screen -->
            <section id="welcome-screen" class="screen active">
                <div class="welcome-content">
                    <h2>مرحباً بك في SuperMind-Train</h2>
                    <p>اختر وضع التدريب المناسب لك وابدأ رحلة التعلم</p>
                    
                    <div class="mode-selection">
                        <button id="practice-mode" class="mode-btn">
                            <div class="mode-icon">📚</div>
                            <h3>وضع الممارسة</h3>
                            <p>تدرب بدون ضغط زمني</p>
                        </button>
                        <button id="exam-mode" class="mode-btn">
                            <div class="mode-icon">📝</div>
                            <h3>وضع الاختبار</h3>
                            <p>اختبار مع زمن محدد</p>
                        </button>
                    </div>

                    <div class="quick-stats">
                        <h3>إحصائيات سريعة</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number" id="total-tests">0</span>
                                <span class="stat-label">اختبارات مكتملة</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number" id="best-score">0%</span>
                                <span class="stat-label">أفضل نتيجة</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Settings Modal -->
            <section id="settings-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>إعدادات الاختبار</h2>
                        <button id="close-settings" class="btn btn-icon" aria-label="إغلاق">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label for="question-count">عدد الأسئلة</label>
                            <select id="question-count">
                                <option value="5">5 أسئلة</option>
                                <option value="10" selected>10 أسئلة</option>
                                <option value="15">15 سؤال</option>
                                <option value="20">20 سؤال</option>
                                <option value="30">30 سؤال</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label for="timer-mode">وضع المؤقت</label>
                            <select id="timer-mode">
                                <option value="off">بدون مؤقت</option>
                                <option value="per-question">زمن لكل سؤال</option>
                                <option value="total-time">زمن إجمالي</option>
                            </select>
                        </div>

                        <div class="setting-group" id="timer-settings">
                            <label for="timer-duration">مدة المؤقت (ثواني)</label>
                            <input type="number" id="timer-duration" min="5" max="300" value="30">
                        </div>

                        <div class="setting-group">
                            <label for="sound-enabled">الصوت</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="sound-enabled" checked>
                                <label for="sound-enabled" class="toggle-label"></label>
                            </div>
                        </div>

                        <div class="setting-group">
                            <label for="language">اللغة</label>
                            <select id="language">
                                <option value="ar" selected>العربية</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-settings" class="btn btn-primary">حفظ الإعدادات</button>
                    </div>
                </div>
            </section>

            <!-- Test Screen -->
            <section id="test-screen" class="screen">
                <div class="test-header">
                    <div class="progress-info">
                        <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="تقدم الاختبار">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                        <span id="question-counter" aria-live="polite">سؤال 1 من 10</span>
                    </div>
                    <div class="timer-display" id="timer-display" aria-live="assertive" aria-label="الوقت المتبقي">
                        <span id="timer-text">00:30</span>
                    </div>
                </div>

                <div class="question-container">
                    <div class="question">
                        <h2 id="question-text">5 × 23 = ?</h2>
                    </div>
                    
                    <div class="answers-grid" role="group" aria-label="خيارات الإجابة">
                        <button class="answer-btn" data-answer="115" aria-label="الإجابة الأولى: 115">115</button>
                        <button class="answer-btn" data-answer="125" aria-label="الإجابة الثانية: 125">125</button>
                        <button class="answer-btn" data-answer="105" aria-label="الإجابة الثالثة: 105">105</button>
                        <button class="answer-btn" data-answer="135" aria-label="الإجابة الرابعة: 135">135</button>
                    </div>
                </div>

                <div class="test-controls">
                    <button id="next-question" class="btn btn-primary" disabled>التالي</button>
                    <button id="end-test" class="btn btn-secondary">إنهاء الاختبار</button>
                </div>
            </section>

            <!-- Results Screen -->
            <section id="results-screen" class="screen">
                <div class="results-content">
                    <div class="score-display">
                        <h2>نتيجة الاختبار</h2>
                        <div class="score-circle">
                            <span id="score-percentage">85%</span>
                        </div>
                        <p id="score-description">ممتاز! لقد حصلت على 17 من 20</p>
                    </div>

                    <div class="results-details">
                        <div class="detail-item">
                            <span class="detail-label">الأسئلة الصحيحة:</span>
                            <span id="correct-count">17</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">الأسئلة الخاطئة:</span>
                            <span id="incorrect-count">3</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">الوقت المستغرق:</span>
                            <span id="total-time">5:23</span>
                        </div>
                    </div>

                    <div class="results-actions">
                        <button id="review-answers" class="btn btn-secondary">راجع الإجابات</button>
                        <button id="export-csv" class="btn btn-outline">تصدير CSV</button>
                        <button id="new-test" class="btn btn-primary">اختبار جديد</button>
                    </div>
                </div>
            </section>

            <!-- Leaderboard Screen -->
            <section id="leaderboard-screen" class="screen">
                <div class="leaderboard-content">
                    <h2>لوحة النتائج</h2>
                    <div id="leaderboard-list" class="leaderboard-list">
                        <!-- Leaderboard entries will be populated here -->
                    </div>
                    <button id="back-to-welcome" class="btn btn-primary">العودة للرئيسية</button>
                </div>
            </section>
        </div>
    </main>

    <!-- Scripts -->
    <script src="app.bundle.js"></script>
</body>
</html>`;
        
        const outputPath = path.join(this.outputDir, 'index.html');
        fs.writeFileSync(outputPath, htmlTemplate);
        
        console.log(`✅ Optimized HTML created: ${outputPath}`);
        return outputPath;
    }
    
    /**
     * Run the build process
     */
    async build() {
        console.log('🚀 Starting build process...');
        
        try {
            await this.bundleJS();
            await this.minifyCSS();
            await this.createOptimizedHTML();
            
            console.log('✅ Build completed successfully!');
            console.log('📁 Output directory:', this.outputDir);
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }
}

// Run build if called directly
if (require.main === module) {
    const buildTool = new BuildTool();
    buildTool.build();
}

module.exports = BuildTool;
