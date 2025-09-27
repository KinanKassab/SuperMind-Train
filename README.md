# مدرّب الضرب - Multiplication Trainer 🚀

A complete, production-ready, responsive web application for training students on multiplication with Arabic UI support.

## 🌟 Features

### Core Functionality
- **Random Question Generation**: First factor (0-10), second factor (0-99)
- **Multiple Choice Answers**: 4 options with 1 correct + 3 intelligent distractors
- **Configurable Settings**: Number of questions, timer modes, practice/exam modes
- **Bilingual Support**: Arabic (default) with English fallback
- **Responsive Design**: Mobile-first approach with RTL support

### Timer Modes
- **No Timer**: Practice without time pressure
- **Per Question**: Individual time limit for each question
- **Total Time**: Overall time limit for the entire test

### Test Modes
- **Practice Mode**: Immediate feedback, no time pressure
- **Exam Mode**: Timed tests with locked answers

### Advanced Features
- **Sound Effects**: Audio feedback for correct/incorrect answers
- **Progress Tracking**: Visual progress bar and question counter
- **Results Analysis**: Detailed score breakdown and time analysis
- **Leaderboard**: Local high scores with player names
- **Data Export**: CSV export for test results
- **Dark/Light Theme**: Toggle between themes
- **Accessibility**: Full keyboard navigation and screen reader support

## 📁 Project Structure

```
SuperMind-Train/
├── index.html                 # Main HTML file
├── styles/
│   └── main.css              # Main stylesheet with RTL support
├── js/
│   ├── app.js                # Main application entry point
│   └── modules/
│       ├── QuestionGenerator.js  # Question generation logic
│       ├── Timer.js              # Timer functionality
│       ├── Storage.js            # LocalStorage operations
│       ├── SoundManager.js       # Audio feedback
│       ├── UI.js                 # User interface management
│       └── TestManager.js        # Test flow management
├── tests/
│   ├── test-question-generator.js # Unit tests for question generator
│   ├── test-timer.js             # Unit tests for timer
│   ├── test-storage.js           # Unit tests for storage
│   └── run-tests.html            # Test runner interface
└── README.md                     # This file
```

## 🚀 Quick Start

### Option 1: Direct File Opening
1. Download all files to a local directory
2. Open `index.html` in a modern web browser
3. Start training immediately!

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Use

### Starting a Test
1. **Choose Mode**: Select "وضع الممارسة" (Practice Mode) or "وضع الاختبار" (Exam Mode)
2. **Configure Settings**: Click "إعدادات" (Settings) to customize:
   - Number of questions (5, 10, 15, 20, 30)
   - Timer mode (Off, Per Question, Total Time)
   - Sound effects (On/Off)
   - Language (Arabic/English)
3. **Begin Test**: Click your chosen mode to start

### During the Test
- **Answer Selection**: Click on one of the 4 answer options
- **Keyboard Shortcuts**:
  - `1-4`: Select answer options
  - `Enter`: Confirm/Next question
  - `N`: Next question
  - `Escape`: Close modals
- **Progress Tracking**: Monitor your progress with the progress bar
- **Timer**: Watch the countdown (if enabled)

### After the Test
- **View Results**: See your score, correct/incorrect answers, and time taken
- **Review Answers**: Click "راجع الإجابات" to see detailed breakdown
- **Export Data**: Click "تصدير CSV" to download results
- **New Test**: Click "اختبار جديد" to start over

## ⚙️ Configuration

### Settings Options
- **عدد الأسئلة (Number of Questions)**: 5, 10, 15, 20, or 30 questions
- **وضع المؤقت (Timer Mode)**:
  - بدون مؤقت (No Timer): Unlimited time
  - زمن لكل سؤال (Per Question): Individual time limits
  - زمن إجمالي (Total Time): Overall time limit
- **مدة المؤقت (Timer Duration)**: 5-300 seconds
- **الصوت (Sound)**: Enable/disable audio feedback
- **اللغة (Language)**: Arabic (default) or English

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Enter**: Activate buttons and confirm selections
- **Arrow Keys**: Navigate within groups
- **Escape**: Close modals and return to previous screen

## 🧪 Testing

### Running Unit Tests
1. Open `tests/run-tests.html` in your browser
2. Click "Run All Tests" to execute all test suites
3. View results for each module:
   - Question Generator Tests
   - Timer Tests
   - Storage Tests

### Test Coverage
- **Question Generation**: Validates factor ranges, answer options, and distractor algorithms
- **Timer Functionality**: Tests countdown, callbacks, and edge cases
- **Data Storage**: Verifies localStorage operations, statistics, and data integrity
- **Error Handling**: Tests graceful failure scenarios

## 🎨 Customization

### Themes
- **Light Theme**: Clean, modern interface (default)
- **Dark Theme**: Easy on the eyes for low-light usage
- **Auto Theme**: Respects system preference

### Styling
The application uses CSS custom properties for easy theming:
```css
:root {
    --primary-color: #4f46e5;
    --success-color: #10b981;
    --error-color: #ef4444;
    /* ... more variables */
}
```

### Adding New Languages
1. Add translations to `UI.js` in the `translations` object
2. Update language selector in `index.html`
3. Test RTL/LTR layout support

## 📊 Data Management

### Local Storage
- **Settings**: User preferences and configuration
- **Statistics**: Test history and performance metrics
- **Leaderboard**: High scores and player records
- **Theme**: User's theme preference

### Data Export
- **CSV Format**: Compatible with Excel and Google Sheets
- **JSON Export**: Full data backup and restore
- **Print Support**: Printer-friendly result pages

### Privacy
- All data stored locally in browser
- No external servers or data collection
- Full user control over data

## 🔧 Technical Details

### Browser Requirements
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript**: ES6 modules support required
- **CSS**: CSS Grid and Flexbox support
- **Audio**: Web Audio API for sound generation

### Performance
- **Lightweight**: No external dependencies
- **Fast Loading**: Optimized assets and minimal bundle size
- **Responsive**: Smooth animations and transitions
- **Accessible**: WCAG 2.1 AA compliance

### Architecture
- **Modular Design**: Separated concerns with ES6 modules
- **Event-Driven**: Clean separation between UI and logic
- **Testable**: Unit tests for core functionality
- **Maintainable**: Clear code structure and documentation

## 🐛 Troubleshooting

### Common Issues
1. **Tests not loading**: Ensure you're running from a local server
2. **Audio not working**: Check browser audio permissions
3. **RTL layout issues**: Verify Arabic font support
4. **Timer not working**: Check browser compatibility

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need local server)
- **Edge**: Full support
- **Internet Explorer**: Not supported

### Performance Issues
- **Slow loading**: Check network connection and browser cache
- **Audio lag**: Reduce system load and close other tabs
- **UI glitches**: Refresh page and clear browser cache

## 🤝 Contributing

### Development Setup
1. Clone or download the project
2. Set up a local server
3. Make changes to the code
4. Test thoroughly
5. Run unit tests
6. Submit improvements

### Code Style
- **JavaScript**: ES6+ with modules
- **CSS**: BEM methodology with custom properties
- **HTML**: Semantic markup with accessibility attributes
- **Comments**: Clear documentation in Arabic and English

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Arabic Typography**: Cairo font family for beautiful Arabic text
- **Icons**: Unicode emoji for cross-platform compatibility
- **Accessibility**: WCAG guidelines for inclusive design
- **Testing**: Custom test framework for reliability

## 📞 Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review the code documentation
3. Run the unit tests
4. Create an issue with detailed information

---

**مدرّب الضرب** - Making multiplication learning fun and effective! 🎯
