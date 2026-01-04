/**
 * UIController Module
 * Manages UI updates and user interactions
 * Follows Single Responsibility Principle: Only manages UI state
 */

export class UIController {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Initialize DOM elements
     * @returns {Object} DOM elements
     */
    initializeElements() {
        return {
            // Status
            statusText: document.getElementById('statusText'),
            statusDot: document.getElementById('statusDot'),
            
            // Language
            languageSelect: document.getElementById('languageSelect'),
            currentLang: document.getElementById('currentLang'),
            
            // Control buttons
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            
            // Format buttons
            boldBtn: document.getElementById('boldBtn'),
            italicBtn: document.getElementById('italicBtn'),
            underlineBtn: document.getElementById('underlineBtn'),
            
            // Utility buttons
            clearBtn: document.getElementById('clearBtn'),
            copyBtn: document.getElementById('copyBtn'),
            
            // Editor
            editor: document.getElementById('editor'),
            
            // Stats
            wordCount: document.getElementById('wordCount'),
            charCount: document.getElementById('charCount')
        };
    }

    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Format buttons
        this.elements.boldBtn?.addEventListener('click', () => {
            this.toggleFormatButton('boldBtn');
        });

        this.elements.italicBtn?.addEventListener('click', () => {
            this.toggleFormatButton('italicBtn');
        });

        this.elements.underlineBtn?.addEventListener('click', () => {
            this.toggleFormatButton('underlineBtn');
        });
    }

    /**
     * Toggle format button active state
     * @param {string} buttonId - Button element ID
     */
    toggleFormatButton(buttonId) {
        const button = this.elements[buttonId];
        if (button) {
            button.classList.toggle('active');
        }
    }

    /**
     * Update status display
     * @param {string} text - Status text
     * @param {string} state - State: 'ready', 'listening', 'detecting', 'processing', 'error'
     */
    updateStatus(text, state = 'ready') {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }

        if (this.elements.statusDot) {
            // Remove all state classes
            this.elements.statusDot.classList.remove('listening', 'detecting', 'processing', 'error');
            
            // Add appropriate state class
            if (state === 'listening') {
                this.elements.statusDot.classList.add('listening');
            } else if (state === 'detecting') {
                this.elements.statusDot.classList.add('detecting');
            } else if (state === 'processing') {
                this.elements.statusDot.classList.add('processing');
            } else if (state === 'error') {
                this.elements.statusDot.classList.add('error');
            }
        }
    }

    /**
     * Update current language display
     * @param {string} languageName - Language name to display
     */
    updateLanguageDisplay(languageName) {
        if (this.elements.currentLang) {
            this.elements.currentLang.textContent = languageName;
        }
    }

    /**
     * Enable/disable start button
     * @param {boolean} enabled - Enable state
     */
    setStartButtonEnabled(enabled) {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = !enabled;
        }
    }

    /**
     * Enable/disable stop button
     * @param {boolean} enabled - Enable state
     */
    setStopButtonEnabled(enabled) {
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !enabled;
        }
    }

    /**
     * Update word and character count
     * @param {number} words - Word count
     * @param {number} chars - Character count
     */
    updateStats(words, chars) {
        if (this.elements.wordCount) {
            this.elements.wordCount.textContent = words.toString();
        }
        if (this.elements.charCount) {
            this.elements.charCount.textContent = chars.toString();
        }
    }

    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Type: 'success', 'error', 'info', 'warning'
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get language select element
     * @returns {HTMLElement} Language select element
     */
    getLanguageSelect() {
        return this.elements.languageSelect;
    }

    /**
     * Get start button element
     * @returns {HTMLElement} Start button element
     */
    getStartButton() {
        return this.elements.startBtn;
    }

    /**
     * Get stop button element
     * @returns {HTMLElement} Stop button element
     */
    getStopButton() {
        return this.elements.stopBtn;
    }

    /**
     * Get clear button element
     * @returns {HTMLElement} Clear button element
     */
    getClearButton() {
        return this.elements.clearBtn;
    }

    /**
     * Get copy button element
     * @returns {HTMLElement} Copy button element
     */
    getCopyButton() {
        return this.elements.copyBtn;
    }

    /**
     * Get bold button element
     * @returns {HTMLElement} Bold button element
     */
    getBoldButton() {
        return this.elements.boldBtn;
    }

    /**
     * Get italic button element
     * @returns {HTMLElement} Italic button element
     */
    getItalicButton() {
        return this.elements.italicBtn;
    }

    /**
     * Get underline button element
     * @returns {HTMLElement} Underline button element
     */
    getUnderlineButton() {
        return this.elements.underlineBtn;
    }

    /**
     * Get editor element
     * @returns {HTMLElement} Editor element
     */
    getEditor() {
        return this.elements.editor;
    }

    /**
     * Confirm action with user
     * @param {string} message - Confirmation message
     * @returns {boolean} User confirmation
     */
    confirm(message) {
        return window.confirm(message);
    }

    /**
     * Show interim text preview
     * @param {string} text - Interim text to display
     */
    showInterimPreview(text) {
        // Remove existing preview
        this.hideInterimPreview();
        
        if (!text) return;
        
        const preview = document.createElement('div');
        preview.className = 'interim-preview';
        preview.id = 'interim-preview';
        preview.textContent = text;
        
        document.body.appendChild(preview);
    }

    /**
     * Hide interim text preview
     */
    hideInterimPreview() {
        const preview = document.getElementById('interim-preview');
        if (preview) {
            document.body.removeChild(preview);
        }
    }

    /**
     * Add CSS animation styles
     */
    static addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add animation styles when module loads
UIController.addAnimationStyles();
