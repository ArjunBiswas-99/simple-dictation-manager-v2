/**
 * CommandProcessor Module
 * Processes voice commands and converts them to actions
 * Follows Single Responsibility Principle: Only processes commands
 */

export class CommandProcessor {
    constructor() {
        this.commands = this.initializeCommands();
    }

    /**
     * Initialize command mappings
     * @returns {Object} Command mappings
     */
    initializeCommands() {
        return {
            // Punctuation commands
            punctuation: {
                'comma': ',',
                'period': '.',
                'full stop': '.',
                'question mark': '?',
                'exclamation mark': '!',
                'exclamation point': '!',
                'colon': ':',
                'semicolon': ';',
                'dash': '-',
                'hyphen': '-',
                'quote': '"',
                'apostrophe': "'",
                'open parenthesis': '(',
                'close parenthesis': ')',
                'open bracket': '[',
                'close bracket': ']'
            },

            // Navigation commands
            navigation: {
                'new line': 'NEW_LINE',
                'enter': 'NEW_LINE',
                'new paragraph': 'NEW_PARAGRAPH',
                'paragraph': 'NEW_PARAGRAPH'
            },

            // Editing commands
            editing: {
                'delete that': 'DELETE_SENTENCE',
                'delete sentence': 'DELETE_SENTENCE',
                'undo': 'UNDO',
                'redo': 'REDO'
            },

            // Formatting commands (future use)
            formatting: {
                'bold': 'BOLD',
                'italic': 'ITALIC',
                'underline': 'UNDERLINE'
            }
        };
    }

    /**
     * Process text and execute commands
     * @param {string} text - Input text to process
     * @returns {Object} Processed result
     */
    process(text) {
        if (!text) {
            return { text: '', hasCommand: false };
        }

        const lowerText = text.toLowerCase().trim();
        let processedText = text;
        let hasCommand = false;
        let command = null;

        // Check for punctuation commands
        for (const [key, value] of Object.entries(this.commands.punctuation)) {
            if (lowerText === key) {
                return {
                    text: value,
                    hasCommand: true,
                    commandType: 'PUNCTUATION',
                    originalCommand: key
                };
            }
        }

        // Check for navigation commands
        for (const [key, value] of Object.entries(this.commands.navigation)) {
            if (lowerText === key || lowerText.includes(key)) {
                return {
                    text: '',
                    hasCommand: true,
                    commandType: 'NAVIGATION',
                    command: value,
                    originalCommand: key
                };
            }
        }

        // Check for editing commands
        for (const [key, value] of Object.entries(this.commands.editing)) {
            if (lowerText === key || lowerText.includes(key)) {
                return {
                    text: '',
                    hasCommand: true,
                    commandType: 'EDITING',
                    command: value,
                    originalCommand: key
                };
            }
        }

        // No command found, return original text
        return {
            text: processedText,
            hasCommand: false
        };
    }

    /**
     * Auto-capitalize sentences
     * @param {string} text - Text to capitalize
     * @param {string} previousText - Previous text for context
     * @returns {string} Capitalized text
     */
    autoCapitalize(text, previousText = '') {
        if (!text) return text;

        // Capitalize if it's the start of document
        if (!previousText || previousText.trim() === '') {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Capitalize after sentence-ending punctuation
        const lastChar = previousText.trim().slice(-1);
        if (['.', '!', '?'].includes(lastChar)) {
            return ' ' + text.charAt(0).toUpperCase() + text.slice(1);
        }

        // Add space before text if needed
        if (previousText && !previousText.endsWith(' ')) {
            return ' ' + text;
        }

        return text;
    }

    /**
     * Clean up text spacing
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    cleanSpacing(text) {
        // Remove multiple spaces
        text = text.replace(/\s+/g, ' ');
        
        // Fix spacing before punctuation
        text = text.replace(/\s+([,.!?;:])/g, '$1');
        
        // Add space after punctuation if missing
        text = text.replace(/([,.!?;:])(\w)/g, '$1 $2');
        
        return text;
    }

    /**
     * Add custom command
     * @param {string} commandType - Type of command (punctuation, navigation, editing)
     * @param {string} trigger - Command trigger word/phrase
     * @param {string} action - Action to perform or text to insert
     */
    addCustomCommand(commandType, trigger, action) {
        if (this.commands[commandType]) {
            this.commands[commandType][trigger.toLowerCase()] = action;
        }
    }

    /**
     * Remove custom command
     * @param {string} commandType - Type of command
     * @param {string} trigger - Command trigger word/phrase
     */
    removeCustomCommand(commandType, trigger) {
        if (this.commands[commandType]) {
            delete this.commands[commandType][trigger.toLowerCase()];
        }
    }

    /**
     * Get all commands
     * @returns {Object} All commands
     */
    getAllCommands() {
        return this.commands;
    }

    /**
     * Get commands by type
     * @param {string} commandType - Type of command
     * @returns {Object} Commands of specified type
     */
    getCommandsByType(commandType) {
        return this.commands[commandType] || {};
    }
}
