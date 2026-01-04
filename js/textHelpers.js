/**
 * TextHelpers Module
 * Handles smart punctuation insertion, wrapping, and list support
 * Follows Single Responsibility Principle: Only manages text helper operations
 */

export class TextHelpers {
    constructor(textEditor) {
        this.textEditor = textEditor;
        this.editor = textEditor.editor;
    }

    /**
     * Wrap selected text with opening and closing characters
     * If no selection, uses smart insert
     * @param {string} openChar - Opening character
     * @param {string} closeChar - Closing character
     */
    wrapOrInsert(openChar, closeChar) {
        const selection = window.getSelection();
        
        if (!selection.rangeCount) {
            return;
        }

        const range = selection.getRangeAt(0);
        
        // If text is selected, wrap it
        if (!range.collapsed) {
            this.wrapSelection(openChar, closeChar, range);
        } else {
            // No selection - use smart insert
            this.smartInsert(openChar, closeChar);
        }
    }

    /**
     * Wrap selected text with characters
     * @param {string} openChar - Opening character
     * @param {string} closeChar - Closing character
     * @param {Range} range - Selection range
     */
    wrapSelection(openChar, closeChar, range) {
        const selectedText = range.toString();
        
        // Create wrapped text
        const wrappedText = openChar + selectedText + closeChar;
        
        // Replace selection with wrapped text
        range.deleteContents();
        const textNode = document.createTextNode(wrappedText);
        range.insertNode(textNode);
        
        // Move cursor after the wrapped text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[TextHelpers] Wrapped text:', selectedText, '→', wrappedText);
    }

    /**
     * Smart insert - adds opening or closing character based on context
     * @param {string} openChar - Opening character
     * @param {string} closeChar - Closing character
     */
    smartInsert(openChar, closeChar) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Get text before cursor
        const textBeforeCursor = this.getTextBeforeCursor(range);
        
        // Count occurrences of opening and closing characters
        const openCount = (textBeforeCursor.match(new RegExp(this.escapeRegex(openChar), 'g')) || []).length;
        const closeCount = (textBeforeCursor.match(new RegExp(this.escapeRegex(closeChar), 'g')) || []).length;
        
        // Determine which character to insert
        let charToInsert;
        if (openCount > closeCount) {
            // More opening than closing - insert closing
            charToInsert = closeChar;
            console.log('[TextHelpers] Smart insert: closing', closeChar);
        } else {
            // Equal or more closing - insert opening
            charToInsert = openChar;
            console.log('[TextHelpers] Smart insert: opening', openChar);
        }
        
        // Insert the character
        this.insertAtCursor(charToInsert);
    }

    /**
     * Get text content before cursor position
     * @param {Range} range - Current range
     * @returns {string} Text before cursor
     */
    getTextBeforeCursor(range) {
        const tempRange = document.createRange();
        tempRange.selectNodeContents(this.editor);
        tempRange.setEnd(range.endContainer, range.endOffset);
        return tempRange.toString();
    }

    /**
     * Insert text at cursor position
     * @param {string} text - Text to insert
     */
    insertAtCursor(text) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Insert bullet point and create list item
     * Smart detection: if already on a bullet line, create new bullet line
     */
    insertBullet() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        // Check if we're at the start of a line or on empty line
        const textBeforeCursor = this.getTextBeforeCursor(range);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // If current line is empty or we're at start, just add bullet
        if (currentLine.trim() === '') {
            this.insertAtCursor('• ');
            console.log('[TextHelpers] Inserted bullet at start of line');
        } else if (currentLine.startsWith('• ')) {
            // Already on a bullet line - create new bullet line
            this.insertAtCursor('\n• ');
            console.log('[TextHelpers] Created new bullet line');
        } else {
            // Middle of text - insert bullet at cursor
            this.insertAtCursor('• ');
            console.log('[TextHelpers] Inserted bullet at cursor');
        }
    }

    /**
     * Insert em dash
     */
    insertEmDash() {
        this.insertAtCursor('—');
        console.log('[TextHelpers] Inserted em dash');
    }

    /**
     * Insert ellipsis
     */
    insertEllipsis() {
        this.insertAtCursor('...');
        console.log('[TextHelpers] Inserted ellipsis');
    }

    /**
     * Escape special regex characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Toggle list mode for selected lines
     * Converts plain lines to bullet list or vice versa
     */
    toggleListForSelection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (!selectedText) {
            // No selection - just insert bullet
            this.insertBullet();
            return;
        }
        
        const lines = selectedText.split('\n');
        const hasAllBullets = lines.every(line => line.trim().startsWith('•') || line.trim() === '');
        
        let newText;
        if (hasAllBullets) {
            // Remove bullets
            newText = lines.map(line => line.replace(/^•\s*/, '')).join('\n');
            console.log('[TextHelpers] Removed bullets from selection');
        } else {
            // Add bullets
            newText = lines.map(line => {
                const trimmed = line.trim();
                return trimmed ? '• ' + trimmed : '';
            }).join('\n');
            console.log('[TextHelpers] Added bullets to selection');
        }
        
        // Replace selection
        range.deleteContents();
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);
        
        // Select the new text
        range.setStartBefore(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
