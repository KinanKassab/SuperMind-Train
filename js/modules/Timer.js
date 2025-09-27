/**
 * Timer Module
 * Handles different timer modes and countdown functionality
 */
export class Timer {
    constructor() {
        this.timerId = null;
        this.startTime = null;
        this.duration = 0;
        this.onTick = null;
        this.onComplete = null;
        this.isRunning = false;
    }
    
    /**
     * Start the timer
     * @param {number} duration - Duration in seconds
     * @param {Function} onTick - Callback for each tick
     * @param {Function} onComplete - Callback when timer completes
     */
    start(duration, onTick = null, onComplete = null) {
        this.stop(); // Stop any existing timer
        
        this.duration = duration;
        this.startTime = Date.now();
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.isRunning = true;
        
        this.timerId = setInterval(() => {
            this.tick();
        }, 1000);
        
        // Initial tick
        this.tick();
    }
    
    /**
     * Stop the timer
     */
    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }
    
    /**
     * Reset the timer
     */
    reset() {
        this.stop();
        this.startTime = null;
        this.duration = 0;
    }
    
    /**
     * Get remaining time
     * @returns {number} Remaining time in seconds
     */
    getRemainingTime() {
        if (!this.isRunning || !this.startTime) {
            return this.duration;
        }
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        return Math.max(0, this.duration - elapsed);
    }
    
    /**
     * Get elapsed time
     * @returns {number} Elapsed time in seconds
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    /**
     * Check if timer has expired
     * @returns {boolean} True if timer has expired
     */
    isExpired() {
        return this.getRemainingTime() <= 0;
    }
    
    /**
     * Timer tick handler
     */
    tick() {
        const remaining = this.getRemainingTime();
        
        if (this.onTick) {
            this.onTick(remaining);
        }
        
        if (remaining <= 0) {
            this.stop();
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Get timer status
     * @returns {Object} Timer status object
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            remaining: this.getRemainingTime(),
            elapsed: this.getElapsedTime(),
            duration: this.duration
        };
    }
}
