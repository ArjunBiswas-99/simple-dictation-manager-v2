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
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    async onKeyDown(e) {
        // Remove dotted underlines on any keypress
        this.removeConvertedUnderlines();
    }

    /**
     * Convert selected text using transliteration
     * Preserves line breaks and paragraph structure
     */
    async convertSelectedText() {
        const editor = document.getElementById('editor');
        const selection = window.getSelection();
        
        if (!selection.rangeCount || selection.isCollapsed) {
            alert('Please select text to convert');
            return;
        }

        const range = selection.getRangeAt(0);
        
        // Extract the HTML content to preserve structure
        const fragment = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        
        // Get plain text for checking
        const selectedText = range.toString();
        
        if (!selectedText.trim()) {
            alert('Please select text to convert');
            return;
        }

        console.log('[TypingMode] Converting selected text:', selectedText);
        console.log('[TypingMode] Original HTML:', tempDiv.innerHTML);

        try {
            // Split by line breaks (both <br> and text nodes)
            const lines = this.extractLines(tempDiv);
            console.log('[TypingMode] Extracted lines:', lines);
            
            // Transliterate each line separately
            const transliteratedLines = [];
            for (const line of lines) {
                if (line.trim()) {
                    const transliterated = await this.transliteration.transliterate(
                        line,
                        this.currentLanguage
                    );
                    transliteratedLines.push(transliterated);
                } else {
                    transliteratedLines.push(line); // Preserve empty lines
                }
            }
            
            console.log('[TypingMode] Transliterated lines:', transliteratedLines);

            // Reconstruct with original structure
            const resultFragment = this.reconstructStructure(transliteratedLines, tempDiv);
            
            // Replace the selection with the new fragment
            range.deleteContents();
            range.insertNode(resultFragment);
            
            // Move cursor after the inserted content
            range.setStartAfter(resultFragment.lastChild || resultFragment);
            range.setEndAfter(resultFragment.lastChild || resultFragment);
            selection.removeAllRanges();
            selection.addRange(range);
            
            console.log('[TypingMode] Text converted with structure preserved');

        } catch (error) {
            console.error('[TypingMode] Conversion error:', error);
            alert('Conversion failed. Please try again.');
        }
    }

    /**
     * Extract lines from HTML content, preserving structure
     * @param {HTMLElement} element - Element containing the text
     * @returns {Array} Array of text lines
     */
    extractLines(element) {
        const lines = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        let currentLine = '';
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                currentLine += node.textContent;
            } else if (node.nodeName === 'BR' || node.nodeName === 'DIV' || node.nodeName === 'P') {
                if (currentLine || lines.length > 0) {
                    lines.push(currentLine);
                    currentLine = '';
                }
            }
        }
        
        // Add the last line
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    /**
     * Reconstruct HTML structure with transliterated text
     * @param {Array} lines - Array of transliterated lines
     * @param {HTMLElement} originalElement - Original element for structure reference
     * @returns {DocumentFragment} Fragment with reconstructed content
     */
    reconstructStructure(lines, originalElement) {
        const fragment = document.createDocumentFragment();
        
        // Check if original had line breaks
        const hasBR = originalElement.querySelector('br') !== null;
        const hasBlocks = originalElement.querySelector('div, p') !== null;
        
        lines.forEach((line, index) => {
            // Create span with converted-text class
            const span = document.createElement('span');
            span.className = 'converted-text';
            span.textContent = line;
            fragment.appendChild(span);
            
            // Add line break between lines (except last)
            if (index < lines.length - 1) {
                if (hasBlocks) {
                    // Use div for block-level separation
                    const br = document.createElement('br');
                    fragment.appendChild(br);
                } else if (hasBR || lines.length > 1) {
                    // Use br for inline separation
                    const br = document.createElement('br');
                    fragment.appendChild(br);
                }
            }
        });
        
        return fragment;
    }

    /**
     * Remove dotted underlines from converted text
     */
    removeConvertedUnderlines() {
        const convertedElements = document.querySelectorAll('.converted-text');
        convertedElements.forEach(span => {
            // Replace span with its text content
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });
    }

    /**
     * Handle input events
     * @param {InputEvent} e - Input event
     */
    async onInput(e) {
        // Remove underlines when typing
        this.removeConvertedUnderlines();
        
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
