/**
 * Main Application Module
 * Coordinates all modules and handles application logic
 * Follows Dependency Injection and Separation of Concerns
 */

import { SpeechRecognition } from './speechRecognition.js';
import { TextEditor } from './textEditor.js';
import { LanguageManager } from './languageManager.js';
import { CommandProcessor } from './commandProcessor.js';
import { UIController } from './uiController.js';
import { Transliteration } from './transliteration.js';
import { TypingMode } from './typingMode.js';

class DictationApp {
    constructor() {
        // Initialize all modules
        this.ui = new UIController();
        this.speechRecognition = new SpeechRecognition();
        this.textEditor = new TextEditor(this.ui.getEditor());
        this.languageManager = new LanguageManager();
        this.commandProcessor = new CommandProcessor();
        this.transliteration = new Transliteration();
        this.typingMode = new TypingMode(this.textEditor, this.transliteration);

        // Application state
        this.isListening = false;
        this.lastTranscript = '';
        this.currentMode = 'dictate'; // 'dictate' or 'type'

        // Initialize app
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        // Check browser support
        if (!SpeechRecognition.isSupported()) {
            this.ui.showNotification('Speech recognition not supported in this browser. Please use Chrome or Edge.', 'error');
            this.ui.setStartButtonEnabled(false);
            return;
        }

        // Setup event handlers
        this.setupEventHandlers();
        this.setupSpeechRecognitionCallbacks();
        this.setupTextEditorCallbacks();
        this.setupLanguageManagerCallbacks();

        // Initial UI update
        this.ui.updateStatus('Ready to start dictation', 'ready');
        this.updateStats();
    }

    /**
     * Setup UI event handlers
     */
    setupEventHandlers() {
        // Mode select
        document.getElementById('modeSelect')?.addEventListener('change', (e) => {
            this.switchMode(e.target.value);
        });

        // Typing language select
        document.getElementById('typingLanguageSelect')?.addEventListener('change', (e) => {
            this.typingMode.setLanguage(e.target.value);
        });

        // Start button
        this.ui.getStartButton()?.addEventListener('click', () => {
            this.startDictation();
        });

        // Stop button
        this.ui.getStopButton()?.addEventListener('click', () => {
            this.stopDictation();
        });

        // Language select
        this.ui.getLanguageSelect()?.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Clear button
        this.ui.getClearButton()?.addEventListener('click', () => {
            this.clearEditor();
        });

        // Copy button
        this.ui.getCopyButton()?.addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Format buttons
        this.ui.getBoldButton()?.addEventListener('click', () => {
            this.textEditor.bold();
            this.textEditor.focus();
        });

        this.ui.getItalicButton()?.addEventListener('click', () => {
            this.textEditor.italic();
            this.textEditor.focus();
        });

        this.ui.getUnderlineButton()?.addEventListener('click', () => {
            this.textEditor.underline();
            this.textEditor.focus();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Setup speech recognition callbacks
     */
    setupSpeechRecognitionCallbacks() {
        // On recognition start
        this.speechRecognition.onStart(() => {
            this.isListening = true;
            this.ui.updateStatus('Listening...', 'listening');
            this.ui.setStartButtonEnabled(false);
            this.ui.setStopButtonEnabled(true);
        });

        // On recognition end
        this.speechRecognition.onEnd(() => {
            this.isListening = false;
            this.ui.updateStatus('Ready to start dictation', 'ready');
            this.ui.setStartButtonEnabled(true);
            this.ui.setStopButtonEnabled(false);
        });

        // On recognition result
        this.speechRecognition.onResult((result) => {
            this.handleSpeechResult(result);
        });

        // On recognition error
        this.speechRecognition.onError((error) => {
            this.handleSpeechError(error);
        });
    }

    /**
     * Setup text editor callbacks
     */
    setupTextEditorCallbacks() {
        // Override content change callback
        this.textEditor.onContentChange = () => {
            this.updateStats();
        };
    }

    /**
     * Setup language manager callbacks
     */
    setupLanguageManagerCallbacks() {
        this.languageManager.onLanguageChange((data) => {
            this.ui.updateLanguageDisplay(data.language.name);
            this.ui.showNotification(`Language changed to ${data.language.name}`, 'success');
        });
    }

    /**
     * Handle speech recognition results
     * @param {Object} result - Recognition result
     */
    handleSpeechResult(result) {
        // Show interim results in preview
        if (!result.isFinal && result.interim) {
            this.ui.showInterimPreview(result.interim);
            this.ui.updateStatus('Detecting speech...', 'detecting');
            return;
        }

        // Hide interim preview when final result comes
        this.ui.hideInterimPreview();
        this.ui.updateStatus('Processing text...', 'processing');

        const transcript = result.final.trim();
        if (!transcript) {
            // No speech detected warning
            this.ui.updateStatus('No speech detected', 'error');
            this.ui.showNotification('⚠️ No speech detected. Please speak clearly.', 'warning');
            
            // Reset to listening after 2 seconds
            setTimeout(() => {
                if (this.isListening) {
                    this.ui.updateStatus('Listening...', 'listening');
                }
            }, 2000);
            return;
        }

        // Process the transcript through command processor
        const processed = this.commandProcessor.process(transcript);

        if (processed.hasCommand) {
            this.executeCommand(processed);
        } else {
            // Regular text - apply auto-capitalization
            const currentText = this.textEditor.getText();
            let textToInsert = this.commandProcessor.autoCapitalize(processed.text, currentText);
            
            this.textEditor.insertText(textToInsert);
        }

        this.lastTranscript = transcript;
        this.textEditor.focus();
        
        // Show success and return to listening
        this.ui.updateStatus('Text added ✓', 'listening');
        setTimeout(() => {
            if (this.isListening) {
                this.ui.updateStatus('Listening...', 'listening');
            }
        }, 1000);
    }

    /**
     * Execute voice command
     * @param {Object} commandData - Command data from processor
     */
    executeCommand(commandData) {
        switch (commandData.commandType) {
            case 'PUNCTUATION':
                this.textEditor.insertText(commandData.text);
                break;

            case 'NAVIGATION':
                if (commandData.command === 'NEW_LINE') {
                    this.textEditor.insertNewLine();
                } else if (commandData.command === 'NEW_PARAGRAPH') {
                    this.textEditor.insertParagraph();
                }
                break;

            case 'EDITING':
                if (commandData.command === 'DELETE_SENTENCE') {
                    this.textEditor.deleteLastSentence();
                } else if (commandData.command === 'UNDO') {
                    this.textEditor.undo();
                } else if (commandData.command === 'REDO') {
                    this.textEditor.redo();
                }
                break;

            default:
                console.warn('Unknown command type:', commandData.commandType);
        }
    }

    /**
     * Handle speech recognition errors
     * @param {string} error - Error type
     */
    handleSpeechError(error) {
        let message = 'Speech recognition error';

        switch (error) {
            case 'no-speech':
                message = '⚠️ No speech detected. Please try speaking again.';
                this.ui.updateStatus('No speech detected', 'error');
                break;
            case 'audio-capture':
                message = '❌ No microphone found. Please check your microphone.';
                this.ui.updateStatus('Microphone error', 'error');
                break;
            case 'not-allowed':
                message = '❌ Microphone access denied. Please allow microphone access.';
                this.ui.updateStatus('Permission denied', 'error');
                break;
            case 'network':
                message = '❌ Network error. Please check your internet connection.';
                this.ui.updateStatus('Network error', 'error');
                break;
            default:
                message = `❌ Speech recognition error: ${error}`;
                this.ui.updateStatus('Error occurred', 'error');
        }

        this.ui.showNotification(message, 'error');
        
        // Hide interim preview on error
        this.ui.hideInterimPreview();
    }

    /**
     * Start dictation
     */
    startDictation() {
        if (this.isListening) {
            console.warn('Already listening');
            return;
        }

        this.speechRecognition.start();
        this.textEditor.focus();
    }

    /**
     * Stop dictation
     */
    stopDictation() {
        if (!this.isListening) {
            console.warn('Not currently listening');
            return;
        }

        this.speechRecognition.stop();
    }

    /**
     * Change language
     * @param {string} languageCode - Language code
     */
    changeLanguage(languageCode) {
        // Update language manager
        this.languageManager.setLanguage(languageCode);
        
        // Update speech recognition
        this.speechRecognition.setLanguage(languageCode);
        
        // Update editor lang attribute for CSS styling
        const editor = this.ui.getEditor();
        if (editor) {
            editor.setAttribute('lang', languageCode);
        }
    }

    /**
     * Clear editor content
     */
    clearEditor() {
        if (this.textEditor.getText().trim() === '') {
            return;
        }

        if (this.ui.confirm('Are you sure you want to clear all text?')) {
            this.textEditor.clear();
            this.updateStats();
            this.ui.showNotification('Editor cleared', 'info');
        }
    }

    /**
     * Copy editor content to clipboard
     */
    async copyToClipboard() {
        const success = await this.textEditor.copyToClipboard();
        
        if (success) {
            this.ui.showNotification('Text copied to clipboard', 'success');
        } else {
            this.ui.showNotification('Failed to copy text', 'error');
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const wordCount = this.textEditor.getWordCount();
        const charCount = this.textEditor.getCharCount();
        this.ui.updateStats(wordCount, charCount);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Don't interfere with typing mode
        if (this.currentMode === 'type') {
            return;
        }

        // Ctrl/Cmd + B = Bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.textEditor.bold();
        }

        // Ctrl/Cmd + I = Italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            this.textEditor.italic();
        }

        // Ctrl/Cmd + U = Underline
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.textEditor.underline();
        }

        // Ctrl/Cmd + Shift + C = Copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            this.copyToClipboard();
        }

        // Ctrl/Cmd + Shift + X = Clear
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
            e.preventDefault();
            this.clearEditor();
        }
    }

    /**
     * Switch between dictate and type mode
     * @param {string} mode - 'dictate' or 'type'
     */
    switchMode(mode) {
        console.log('[App] Switching mode to:', mode);
        this.currentMode = mode;

        if (mode === 'type') {
            // Stop dictation if active
            if (this.isListening) {
                console.log('[App] Stopping active dictation');
                this.stopDictation();
            }

            // Enable typing mode
            console.log('[App] Enabling typing mode');
            this.typingMode.enable();

            // Show typing language selector
            const typingSection = document.getElementById('typingLanguageSection');
            if (typingSection) {
                typingSection.style.display = 'flex';
                console.log('[App] Typing language selector shown');
            }

            // Update UI
            this.ui.setStartButtonEnabled(false);
            this.ui.updateStatus('Typing mode - Click in text to edit', 'ready');
            this.ui.showNotification('Typing mode enabled. Type and press space for transliteration.', 'info');
            console.log('[App] Typing mode fully enabled');

        } else {
            console.log('[App] Switching to dictate mode');
            
            // Disable typing mode
            this.typingMode.disable();

            // Hide typing language selector
            const typingSection = document.getElementById('typingLanguageSection');
            if (typingSection) {
                typingSection.style.display = 'none';
            }

            // Update UI
            this.ui.setStartButtonEnabled(true);
            this.ui.updateStatus('Ready to start dictation', 'ready');
            this.ui.showNotification('Dictation mode enabled', 'info');
            console.log('[App] Dictation mode enabled');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dictationApp = new DictationApp();
});
