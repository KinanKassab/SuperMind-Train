/**
 * Accessibility Module
 * Handles accessibility features, keyboard navigation, and screen reader support
 */
export class Accessibility {
    constructor() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.currentFocusIndex = 0;
        this.focusableList = [];
        this.init();
    }
    
    /**
     * Initialize accessibility features
     */
    init() {
        try {
            this.setupKeyboardNavigation();
            this.setupARIA();
            this.setupFocusManagement();
            this.setupScreenReaderSupport();
        } catch (error) {
            console.warn('Accessibility initialization failed:', error);
        }
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Update focusable elements when DOM changes
        this.updateFocusableElements();
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardNavigation(e) {
        const { key, ctrlKey, altKey, shiftKey } = e;
        
        // Skip if modifier keys are pressed
        if (ctrlKey || altKey || shiftKey) return;
        
        switch (key) {
            case 'Tab':
                this.handleTabNavigation(e);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleArrowNavigation(e);
                break;
            case 'Enter':
            case ' ':
                this.handleActivation(e);
                break;
            case 'Escape':
                this.handleEscape(e);
                break;
            case 'Home':
                this.handleHome(e);
                break;
            case 'End':
                this.handleEnd(e);
                break;
        }
    }
    
    /**
     * Handle Tab navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleTabNavigation(e) {
        // Let browser handle default Tab behavior
        // We just track the current focus
        setTimeout(() => {
            this.updateCurrentFocus();
        }, 0);
    }
    
    /**
     * Handle arrow key navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleArrowNavigation(e) {
        e.preventDefault();
        
        const currentElement = document.activeElement;
        const parent = currentElement.closest('[role="group"], .answers-grid, .mode-selection');
        
        if (!parent) return;
        
        const focusableInGroup = Array.from(parent.querySelectorAll(this.focusableElements));
        const currentIndex = focusableInGroup.indexOf(currentElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % focusableInGroup.length;
        } else {
            nextIndex = (currentIndex - 1 + focusableInGroup.length) % focusableInGroup.length;
        }
        
        focusableInGroup[nextIndex].focus();
    }
    
    /**
     * Handle element activation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleActivation(e) {
        const element = document.activeElement;
        
        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
            e.preventDefault();
            element.click();
        }
    }
    
    /**
     * Handle Escape key
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleEscape(e) {
        // Close any open modals
        const modal = document.querySelector('.modal.active');
        if (modal) {
            const closeBtn = modal.querySelector('[aria-label*="إغلاق"], [aria-label*="close"]');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }
    
    /**
     * Handle Home key
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleHome(e) {
        e.preventDefault();
        const firstFocusable = this.focusableList[0];
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    /**
     * Handle End key
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleEnd(e) {
        e.preventDefault();
        const lastFocusable = this.focusableList[this.focusableList.length - 1];
        if (lastFocusable) {
            lastFocusable.focus();
        }
    }
    
    /**
     * Setup ARIA attributes
     */
    setupARIA() {
        // Add ARIA labels to buttons without text
        const iconButtons = document.querySelectorAll('.btn-icon');
        iconButtons.forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'زر الإجراء');
            }
        });
        
        // Add ARIA live regions for dynamic content
        this.createLiveRegion('status', 'حالة التطبيق');
        this.createLiveRegion('timer', 'مؤقت الاختبار');
        this.createLiveRegion('score', 'نتيجة الاختبار');
    }
    
    /**
     * Create ARIA live region
     * @param {string} id - Region ID
     * @param {string} label - Region label
     */
    createLiveRegion(id, label) {
        const region = document.createElement('div');
        region.id = id;
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-label', label);
        region.style.position = 'absolute';
        region.style.left = '-10000px';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.overflow = 'hidden';
        
        document.body.appendChild(region);
    }
    
    /**
     * Announce to screen readers
     * @param {string} message - Message to announce
     * @param {string} region - Live region ID
     */
    announce(message, region = 'status') {
        const liveRegion = document.getElementById(region);
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocusInModal(e);
            }
        });
        
        // Restore focus when closing modals
        this.setupFocusRestoration();
    }
    
    /**
     * Trap focus within modal
     * @param {KeyboardEvent} e - Keyboard event
     */
    trapFocusInModal(e) {
        const modal = document.querySelector('.modal.active');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Setup focus restoration
     */
    setupFocusRestoration() {
        let lastFocusedElement = null;
        
        // Store focus when opening modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger]')) {
                lastFocusedElement = document.activeElement;
            }
        });
        
        // Restore focus when closing modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-close]') && lastFocusedElement) {
                setTimeout(() => {
                    lastFocusedElement.focus();
                }, 100);
            }
        });
    }
    
    /**
     * Update focusable elements list
     */
    updateFocusableElements() {
        this.focusableList = Array.from(document.querySelectorAll(this.focusableElements))
            .filter(el => !el.disabled && !el.hidden);
    }
    
    /**
     * Update current focus index
     */
    updateCurrentFocus() {
        const activeElement = document.activeElement;
        this.currentFocusIndex = this.focusableList.indexOf(activeElement);
    }
    
    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Add screen reader only text
        this.addScreenReaderText();
        
        // Setup dynamic content announcements
        this.setupDynamicAnnouncements();
    }
    
    /**
     * Add screen reader only text
     */
    addScreenReaderText() {
        // Add skip links
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const main = document.querySelector('main');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('role', 'main');
        }
    }
    
    /**
     * Setup dynamic announcements
     */
    setupDynamicAnnouncements() {
        // Simplified announcements - only for critical changes
        try {
            // Announce question changes
            const questionObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const target = mutation.target;
                        if (target.id === 'question-text') {
                            this.announce(`سؤال جديد: ${target.textContent}`, 'status');
                        }
                    }
                });
            });
            
            questionObserver.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        } catch (error) {
            console.warn('Dynamic announcements setup failed:', error);
        }
    }
    
    /**
     * Enhance button accessibility
     * @param {HTMLElement} button - Button element
     * @param {string} label - Accessible label
     */
    enhanceButton(button, label) {
        button.setAttribute('aria-label', label);
        button.setAttribute('role', 'button');
        
        if (!button.textContent.trim()) {
            button.setAttribute('aria-label', label);
        }
    }
    
    /**
     * Enhance form accessibility
     * @param {HTMLElement} form - Form element
     */
    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || 'label-' + input.id);
                }
            }
        });
    }
    
    /**
     * Setup high contrast mode support
     */
    setupHighContrastSupport() {
        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.setAttribute('data-high-contrast', 'true');
            } else {
                document.documentElement.removeAttribute('data-high-contrast');
            }
        });
    }
    
    /**
     * Setup reduced motion support
     */
    setupReducedMotionSupport() {
        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.setAttribute('data-reduced-motion', 'true');
            } else {
                document.documentElement.removeAttribute('data-reduced-motion');
            }
        });
    }
    
    /**
     * Get accessibility status
     * @returns {Object} Accessibility status
     */
    getStatus() {
        return {
            focusableElements: this.focusableList.length,
            currentFocus: this.currentFocusIndex,
            hasLiveRegions: document.querySelectorAll('[aria-live]').length > 0,
            hasSkipLinks: document.querySelectorAll('.skip-link').length > 0,
            hasLandmarks: document.querySelectorAll('[role="main"], [role="banner"], [role="contentinfo"]').length > 0
        };
    }
}
