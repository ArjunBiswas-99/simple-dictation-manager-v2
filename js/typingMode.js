/**
 * TypingMode Module
 * Handles manual typing with transliteration support
 * Follows Single Responsibility Principle: Only manages typing mode
 */

export class TypingMode {
    constructor(textEditor, transliteration) {
        this.textEditor = textEditor;
        this.transliteration = transliteration;
        this.isActive = false;
        this.currentLanguage = 'en';
        this.typingBuffer = '';
        this.onLanguageChangeCallback = null;
    }

    /**
     * Enable typing mode
     */
    enable() {
        if (this.isActive) return;

        this.isActive = true;
        this.typingBuffer = '';
        this.setupTypingListeners();
        this.textEditor.focus();
    }

    /**
     * Disable typing mode
     */
    disable() {
        if (!this.isActive) return;

        this.isActive = false;
        this.removeTypingListeners();
        this.typingBuffer = '';
    }

    /**
     * Setup typing event listeners
     */
    setupTypingListeners() {
        this.handleKeyDown = this.onKeyDown.bind(this);
        this.handleInput = this.onInput.bind(this);
        
        const editor = this.textEditor.editor;
        editor.addEventListener('keydown', this.handleKeyDown);
        editor.addEventListener('input', this.handleInput);
    }

    /**
     * Remove typing event listeners
     */
    removeTypingListeners() {
        const editor = this.textEditor.editor;
        if (this.handleKeyDown) {
            editor.removeEventListener('keydown', this.handleKeyDown);
        }
        if (this.handleInput) {
            editor.removeEventListener('input', this.handleInput);
        }
    }

    /**
     * Handle keydown events for transliteration trigger
     * @param {KeyboardEvent} e - Keyboard event
     */
    async onKeyDown(e) {
        // Trigger transliteration on space or punctuation
        if (e.key === ' ' || e.key === '.' || e.key === ',' || e.key === '!' || e.key === '?') {
            if (this.currentLanguage === 'hi' || this.currentLanguage === 'bn') {
                e.preventDefault(); // Prevent default to control the space insertion
                await this.processTransliterationOnSpace();
            }
        }
    }

    /**
     * Process transliteration when space is pressed
     */
    async processTransliterationOnSpace() {
        const text = this.textEditor.getText();
        
        // Get the last word before cursor
        const words = text.trim().split(/\s+/);
        const lastWord = words[words.length - 1];

        if (!lastWord || !lastWord.trim() || !/[a-zA-Z]+/.test(lastWord)) {
            // No valid word to transliterate, just add space
            this.textEditor.insertText(' ');
            return;
        }

        console.log('Transliterating:', lastWord); // Debug log

        try {
            const transliterated = await this.transliteration.transliterate(
                lastWord,
                this.currentLanguage
            );

            console.log('Result:', transliterated); // Debug log

            if (transliterated && transliterated !== lastWord) {
                // Replace the last word with transliterated version
                this.replaceLastWord(transliterated);
            }

            // Add the space after transliteration
            this.textEditor.insertText(' ');

        } catch (error) {
            console.error('Transliteration error:', error);
            // On error, just add the space
            this.textEditor.insertText(' ');
        }
    }

    /**
     * Handle input events
     * @param {InputEvent} e - Input event
     */
    async onInput(e) {
        // Track typing for transliteration
        if (this.currentLanguage === 'hi' || this.currentLanguage === 'bn') {
            // Debounce for performance
            clearTimeout(this.inputTimeout);
            this.inputTimeout = setTimeout(() => {
                this.updateTypingBuffer();
            }, 50);
        }
    }

    /**
     * Update typing buffer with current word
     */
    updateTypingBuffer() {
        const text = this.textEditor.getText();
        const words = text.split(/\s+/);
        this.typingBuffer = words[words.length - 1] || '';
    }

    /**
     * Process transliteration for the current word
     */
    async processTransliteration() {
        if (!this.typingBuffer || this.typingBuffer.trim() === '') {
            return;
        }

        // Only transliterate English characters
        if (!/[a-zA-Z]+/.test(this.typingBuffer)) {
            this.typingBuffer = '';
            return;
        }

        try {
            const transliterated = await this.transliteration.transliterate(
                this.typingBuffer,
                this.currentLanguage
            );

            if (transliterated && transliterated !== this.typingBuffer) {
                this.replaceLastWord(transliterated);
            }

            this.typingBuffer = '';
        } catch (error) {
            console.error('Transliteration processing error:', error);
            this.typingBuffer = '';
        }
    }

    /**
     * Replace the last typed word with transliterated text
     * @param {string} newWord - Transliterated word
     */
    replaceLastWord(newWord) {
        const text = this.textEditor.getText();
        const words = text.trim().split(/\s+/);
        
        if (words.length > 0) {
            // Replace last word
            words[words.length - 1] = newWord;
            const newText = words.join(' ');
            
            // Update editor content
            this.textEditor.editor.textContent = newText;
            
            // Move cursor to end
            const range = document.createRange();
            const selection = window.getSelection();
            
            if (this.textEditor.editor.childNodes.length > 0) {
                const lastNode = this.textEditor.editor.childNodes[this.textEditor.editor.childNodes.length - 1];
                range.setStartAfter(lastNode);
                range.setEndAfter(lastNode);
            } else {
                range.selectNodeContents(this.textEditor.editor);
                range.collapse(false);
            }
            
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Set typing language
     * @param {string} languageCode - Language code
     */
    setLanguage(languageCode) {
        this.currentLanguage = languageCode;
        this.transliteration.setLanguage(languageCode);
        this.typingBuffer = '';

        // Notify callback
        if (this.onLanguageChangeCallback) {
            this.onLanguageChangeCallback(languageCode);
        }
    }

    /**
     * Get current typing language
     * @returns {string}
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if typing mode is active
     * @returns {boolean}
     */
    isTypingModeActive() {
        return this.isActive;
    }

    /**
     * Set callback for language change
     * @param {Function} callback - Callback function
     */
    onLanguageChange(callback) {
        this.onLanguageChangeCallback = callback;
    }

    /**
     * Insert text with language tag for styling
     * @param {string} text - Text to insert
     * @param {string} languageCode - Language code
     */
    insertTextWithLanguage(text, languageCode) {
        if (!text) return;

        // Create span with language class for styling
        const span = document.createElement('span');
        span.className = `lang-${languageCode}`;
        span.textContent = text;

        // Insert at cursor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(span);

            // Move cursor after inserted text
            range.setStartAfter(span);
            range.setEndAfter(span);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}
