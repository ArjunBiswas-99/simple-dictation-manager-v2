/**
 * TextEditor Module
 * Handles text editing operations and formatting
 * Follows Single Responsibility Principle: Only manages text content
 */

export class TextEditor {
    constructor(editorElement) {
        this.editor = editorElement;
        this.setupEditor();
    }

    /**
     * Setup editor with event listeners
     */
    setupEditor() {
        // Prevent default paste behavior to clean up pasted content
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Track content changes
        this.editor.addEventListener('input', () => {
            this.onContentChange();
        });

        // Handle keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (!modifier) return;

        switch (e.key.toLowerCase()) {
            case 'z':
                if (e.shiftKey) {
                    // Ctrl/Cmd + Shift + Z: Redo
                    e.preventDefault();
                    this.redo();
                } else {
                    // Ctrl/Cmd + Z: Undo
                    e.preventDefault();
                    this.undo();
                }
                break;

            case 'y':
                // Ctrl/Cmd + Y: Redo (Windows style)
                if (!isMac) {
                    e.preventDefault();
                    this.redo();
                }
                break;

            case 'a':
                // Ctrl/Cmd + A: Select All (let default behavior work)
                break;

            case 'c':
                // Ctrl/Cmd + C: Copy (let default behavior work)
                break;

            case 'v':
                // Ctrl/Cmd + V: Paste (handled by paste event listener)
                break;

            case 'x':
                // Ctrl/Cmd + X: Cut (let default behavior work)
                break;

            case 'b':
                // Ctrl/Cmd + B: Bold
                e.preventDefault();
                this.bold();
                break;

            case 'i':
                // Ctrl/Cmd + I: Italic
                e.preventDefault();
                this.italic();
                break;

            case 'u':
                // Ctrl/Cmd + U: Underline
                e.preventDefault();
                this.underline();
                break;
        }
    }

    /**
     * Insert text at cursor position
     * @param {string} text - Text to insert
     */
    insertText(text) {
        if (!text) return;

        // Get current selection
        const selection = window.getSelection();
        
        if (selection.rangeCount === 0) {
            // No selection, append to end
            this.editor.textContent += text;
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create text node
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Scroll to cursor
        this.scrollToCursor();
    }

    /**
     * Get all text content
     * @returns {string} Plain text content
     */
    getText() {
        return this.editor.textContent || '';
    }

    /**
     * Get HTML content
     * @returns {string} HTML content
     */
    getHTML() {
        return this.editor.innerHTML;
    }

    /**
     * Clear all content
     */
    clear() {
        this.editor.innerHTML = '';
    }

    /**
     * Apply bold formatting
     */
    bold() {
        document.execCommand('bold', false, null);
    }

    /**
     * Apply italic formatting
     */
    italic() {
        document.execCommand('italic', false, null);
    }

    /**
     * Apply underline formatting
     */
    underline() {
        document.execCommand('underline', false, null);
    }

    /**
     * Insert new line
     */
    insertNewLine() {
        document.execCommand('insertLineBreak', false, null);
    }

    /**
     * Insert paragraph break
     */
    insertParagraph() {
        document.execCommand('insertParagraph', false, null);
    }

    /**
     * Delete last sentence
     */
    deleteLastSentence() {
        const text = this.getText();
        const sentences = text.split(/[.!?]\s*/);
        
        if (sentences.length > 1) {
            sentences.pop();
            this.editor.textContent = sentences.join('. ') + (sentences.length > 0 ? '.' : '');
        }
    }

    /**
     * Undo last action
     */
    undo() {
        document.execCommand('undo', false, null);
    }

    /**
     * Redo last action
     */
    redo() {
        document.execCommand('redo', false, null);
    }

    /**
     * Get word count
     * @returns {number} Number of words
     */
    getWordCount() {
        const text = this.getText().trim();
        if (!text) return 0;
        return text.split(/\s+/).length;
    }

    /**
     * Get character count
     * @returns {number} Number of characters
     */
    getCharCount() {
        return this.getText().length;
    }

    /**
     * Copy content to clipboard
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard() {
        const text = this.getText();
        
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    }

    /**
     * Scroll editor to cursor position
     */
    scrollToCursor() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = this.editor.getBoundingClientRect();

        if (rect.bottom > editorRect.bottom || rect.top < editorRect.top) {
            this.editor.scrollTop += (rect.top - editorRect.top) - (editorRect.height / 2);
        }
    }

    /**
     * Focus editor
     */
    focus() {
        this.editor.focus();
        
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (this.editor.childNodes.length > 0) {
            const lastNode = this.editor.childNodes[this.editor.childNodes.length - 1];
            range.setStartAfter(lastNode);
            range.setEndAfter(lastNode);
        } else {
            range.selectNodeContents(this.editor);
        }
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Check if formatting is active
     * @param {string} command - Format command (bold, italic, underline)
     * @returns {boolean}
     */
    isFormatActive(command) {
        return document.queryCommandState(command);
    }

    /**
     * Callback for content changes (to be overridden)
     */
    onContentChange() {
        // Override this method to handle content changes
    }
}
