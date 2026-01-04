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
        if (this.isActive) {
            console.log('[TypingMode] Already active');
            return;
        }

        console.log('[TypingMode] Enabling typing mode');
        this.isActive = true;
        this.typingBuffer = '';
        this.setupTypingListeners();
        this.textEditor.focus();
        console.log('[TypingMode] Typing mode enabled');
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
        console.log('[TypingMode] Setting up event listeners');
        this.handleKeyDown = this.onKeyDown.bind(this);
        this.handleInput = this.onInput.bind(this);
        
        const editor = this.textEditor.editor;
        editor.addEventListener('keydown', this.handleKeyDown);
        editor.addEventListener('input', this.handleInput);
        console.log('[TypingMode] Event listeners attached');
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
        console.log('[TypingMode] Key pressed:', e.key, 'Language:', this.currentLanguage);
        
        // Trigger transliteration on space or punctuation
        if (e.key === ' ' || e.key === '.' || e.key === ',' || e.key === '!' || e.key === '?') {
            console.log('[TypingMode] Trigger key detected');
            
            if (this.currentLanguage === 'hi' || this.currentLanguage === 'bn') {
                console.log('[TypingMode] Language requires transliteration, preventing default');
                e.preventDefault(); // Prevent default to control the space insertion
                await this.processTransliterationOnSpace();
            } else {
                console.log('[TypingMode] Language does not require transliteration');
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
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const editor = this.textEditor.editor;
        
        // Get text before cursor
        const tempRange = document.createRange();
        tempRange.selectNodeContents(editor);
        tempRange.setEnd(range.endContainer, range.endOffset);
        const textBeforeCursor = tempRange.toString();
        
        // Find the last word
        const match = textBeforeCursor.match(/([a-zA-Z\u0980-\u09FF\u0900-\u097F]+)$/);
        if (!match) {
            console.log('[TypingMode] No word found to replace');
            return;
        }
        
        const lastWord = match[1];
        const wordStart = textBeforeCursor.length - lastWord.length;
        
        // Create range for the last word
        const wordRange = document.createRange();
        wordRange.selectNodeContents(editor);
        
        let charCount = 0;
        let startNode = null;
        let startOffset = 0;
        
        // Find the start position of the last word
        const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent.length;
            
            if (charCount + nodeLength >= wordStart) {
                startNode = node;
                startOffset = wordStart - charCount;
                break;
            }
            charCount += nodeLength;
        }
        
        if (startNode) {
            wordRange.setStart(startNode, startOffset);
            wordRange.setEnd(range.endContainer, range.endOffset);
            
            // Replace with transliterated text
            wordRange.deleteContents();
            const textNode = document.createTextNode(newWord);
            wordRange.insertNode(textNode);
            
            // Position cursor after the new word
            const newRange = document.createRange();
            newRange.setStartAfter(textNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            console.log('[TypingMode] Replaced', lastWord, 'with', newWord);
        }
    }

    /**
     * Set typing language
     * @param {string} languageCode - Language code
     */
    setLanguage(languageCode) {
        console.log('[TypingMode] Setting language to:', languageCode);
        this.currentLanguage = languageCode;
        this.transliteration.setLanguage(languageCode);
        this.typingBuffer = '';

        // Notify callback
        if (this.onLanguageChangeCallback) {
            this.onLanguageChangeCallback(languageCode);
        }
        console.log('[TypingMode] Language set to:', this.currentLanguage);
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
