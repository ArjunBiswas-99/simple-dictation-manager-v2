/**
 * SpeechRecognition Module
 * Handles Web Speech API for real-time speech-to-text conversion
 * Follows Single Responsibility Principle: Only manages speech recognition
 */

export class SpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onStartCallback = null;
        this.onEndCallback = null;
        
        this.initializeRecognition();
    }

    /**
     * Initialize Web Speech API
     */
    initializeRecognition() {
        // Check if browser supports Web Speech API
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognitionAPI) {
            console.error('Web Speech API not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognitionAPI();
        
        // Configuration
        this.recognition.continuous = true; // Keep listening until stopped
        this.recognition.interimResults = true; // Get results while speaking
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;

        // Event handlers
        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for recognition
     */
    setupEventHandlers() {
        if (!this.recognition) return;

        // When recognition starts
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStartCallback) {
                this.onStartCallback();
            }
        };

        // When recognition ends
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };

        // When results are received
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // Process all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Send results to callback
            if (this.onResultCallback) {
                this.onResultCallback({
                    final: finalTranscript,
                    interim: interimTranscript,
                    isFinal: finalTranscript.length > 0
                });
            }
        };

        // Error handling
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }

            // Auto-restart on certain errors
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                this.isListening = false;
            }
        };
    }

    /**
     * Start listening
     */
    start() {
        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return;
        }

        if (this.isListening) {
            console.warn('Already listening');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }

    /**
     * Stop listening
     */
    stop() {
        if (!this.recognition) return;

        if (!this.isListening) {
            console.warn('Not currently listening');
            return;
        }

        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    /**
     * Change language
     * @param {string} languageCode - Language code (e.g., 'en-US', 'hi-IN')
     */
    setLanguage(languageCode) {
        this.currentLanguage = languageCode;
        
        if (this.recognition) {
            this.recognition.lang = languageCode;
        }

        // If currently listening, restart with new language
        if (this.isListening) {
            this.stop();
            setTimeout(() => {
                this.start();
            }, 100);
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if currently listening
     * @returns {boolean}
     */
    isActive() {
        return this.isListening;
    }

    /**
     * Set callback for results
     * @param {Function} callback - Function to call with results
     */
    onResult(callback) {
        this.onResultCallback = callback;
    }

    /**
     * Set callback for errors
     * @param {Function} callback - Function to call on error
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Set callback for start event
     * @param {Function} callback - Function to call when recognition starts
     */
    onStart(callback) {
        this.onStartCallback = callback;
    }

    /**
     * Set callback for end event
     * @param {Function} callback - Function to call when recognition ends
     */
    onEnd(callback) {
        this.onEndCallback = callback;
    }

    /**
     * Check if Web Speech API is supported
     * @returns {boolean}
     */
    static isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
}
