/**
 * Sound Manager Module
 * Handles audio feedback for correct/incorrect answers
 */
export class SoundManager {
    constructor() {
        this.sounds = {
            correct: null,
            incorrect: null
        };
        this.enabled = true;
        this.init();
    }
    
    /**
     * Initialize sound manager
     */
    init() {
        try {
            // Create audio elements for sounds
            this.sounds.correct = this.createAudioElement('correct');
            this.sounds.incorrect = this.createAudioElement('incorrect');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }
    
    /**
     * Create audio element
     * @param {string} type - Sound type
     * @returns {HTMLAudioElement} Audio element
     */
    createAudioElement(type) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.5;
        
        // Generate simple beep sounds using Web Audio API
        if (type === 'correct') {
            this.generateCorrectSound(audio);
        } else if (type === 'incorrect') {
            this.generateIncorrectSound(audio);
        }
        
        return audio;
    }
    
    /**
     * Generate correct answer sound
     * @param {HTMLAudioElement} audio - Audio element
     */
    generateCorrectSound(audio) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Fallback to simple beep
            console.warn('Web Audio API not available, using fallback');
        }
    }
    
    /**
     * Generate incorrect answer sound
     * @param {HTMLAudioElement} audio - Audio element
     */
    generateIncorrectSound(audio) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Fallback to simple beep
            console.warn('Web Audio API not available, using fallback');
        }
    }
    
    /**
     * Play correct answer sound
     */
    playCorrect() {
        if (!this.enabled) return;
        
        try {
            if (this.sounds.correct) {
                this.sounds.correct.currentTime = 0;
                this.sounds.correct.play().catch(error => {
                    console.warn('Failed to play correct sound:', error);
                });
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }
    
    /**
     * Play incorrect answer sound
     */
    playIncorrect() {
        if (!this.enabled) return;
        
        try {
            if (this.sounds.incorrect) {
                this.sounds.incorrect.currentTime = 0;
                this.sounds.incorrect.play().catch(error => {
                    console.warn('Failed to play incorrect sound:', error);
                });
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }
    
    /**
     * Enable/disable sounds
     * @param {boolean} enabled - Whether sounds are enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Check if sounds are enabled
     * @returns {boolean} True if sounds are enabled
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Play success sound for perfect score
     */
    playSuccess() {
        if (!this.enabled) return;
        
        // Play a sequence of ascending tones for success
        this.playToneSequence([440, 554, 659, 880], [0.1, 0.1, 0.1, 0.2]);
    }
    
    /**
     * Play tone sequence
     * @param {Array} frequencies - Array of frequencies
     * @param {Array} durations - Array of durations
     */
    playToneSequence(frequencies, durations) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let currentTime = audioContext.currentTime;
            
            frequencies.forEach((frequency, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, currentTime);
                gainNode.gain.setValueAtTime(0.2, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + durations[index]);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + durations[index]);
                
                currentTime += durations[index];
            });
        } catch (error) {
            console.warn('Tone sequence playback failed:', error);
        }
    }
    
    /**
     * Test sound functionality
     * @returns {boolean} True if sounds are working
     */
    testSounds() {
        try {
            this.playCorrect();
            return true;
        } catch (error) {
            console.warn('Sound test failed:', error);
            return false;
        }
    }
}
