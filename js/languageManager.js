/**
 * LanguageManager Module
 * Manages language selection and switching
 * Follows Single Responsibility Principle: Only manages language state
 */

export class LanguageManager {
    constructor() {
        this.currentLanguage = 'en-US';
        this.languages = {
            'en-US': {
                code: 'en-US',
                name: 'English',
                nativeName: 'English (US)',
                direction: 'ltr'
            },
            'hi-IN': {
                code: 'hi-IN',
                name: 'Hindi',
                nativeName: 'हिन्दी',
                direction: 'ltr'
            },
            'bn-IN': {
                code: 'bn-IN',
                name: 'Bengali',
                nativeName: 'বাংলা',
                direction: 'ltr'
            },
            'de-DE': {
                code: 'de-DE',
                name: 'German',
                nativeName: 'Deutsch',
                direction: 'ltr'
            },
            'es-ES': {
                code: 'es-ES',
                name: 'Spanish',
                nativeName: 'Español',
                direction: 'ltr'
            }
        };
        
        this.onLanguageChangeCallback = null;
    }

    /**
     * Set current language
     * @param {string} languageCode - Language code (e.g., 'en-US')
     * @returns {boolean} Success status
     */
    setLanguage(languageCode) {
        if (!this.languages[languageCode]) {
            console.error(`Language ${languageCode} not supported`);
            return false;
        }

        const previousLanguage = this.currentLanguage;
        this.currentLanguage = languageCode;

        // Notify callback
        if (this.onLanguageChangeCallback) {
            this.onLanguageChangeCallback({
                previous: previousLanguage,
                current: languageCode,
                language: this.languages[languageCode]
            });
        }

        return true;
    }

    /**
     * Get current language code
     * @returns {string} Current language code
     */
    getLanguageCode() {
        return this.currentLanguage;
    }

    /**
     * Get current language info
     * @returns {Object} Language information
     */
    getCurrentLanguage() {
        return this.languages[this.currentLanguage];
    }

    /**
     * Get language name
     * @param {string} languageCode - Language code
     * @returns {string} Language name
     */
    getLanguageName(languageCode = null) {
        const code = languageCode || this.currentLanguage;
        return this.languages[code]?.name || 'Unknown';
    }

    /**
     * Get language native name
     * @param {string} languageCode - Language code
     * @returns {string} Language native name
     */
    getLanguageNativeName(languageCode = null) {
        const code = languageCode || this.currentLanguage;
        return this.languages[code]?.nativeName || 'Unknown';
    }

    /**
     * Get all supported languages
     * @returns {Object} All languages
     */
    getAllLanguages() {
        return this.languages;
    }

    /**
     * Check if language is supported
     * @param {string} languageCode - Language code
     * @returns {boolean}
     */
    isLanguageSupported(languageCode) {
        return !!this.languages[languageCode];
    }

    /**
     * Get text direction for current language
     * @returns {string} 'ltr' or 'rtl'
     */
    getTextDirection() {
        return this.languages[this.currentLanguage]?.direction || 'ltr';
    }

    /**
     * Set callback for language change
     * @param {Function} callback - Function to call when language changes
     */
    onLanguageChange(callback) {
        this.onLanguageChangeCallback = callback;
    }

    /**
     * Get language list for dropdown
     * @returns {Array} Array of language objects
     */
    getLanguageList() {
        return Object.values(this.languages).map(lang => ({
            code: lang.code,
            name: lang.name,
            nativeName: lang.nativeName
        }));
    }
}
