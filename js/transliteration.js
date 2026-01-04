/**
 * Transliteration Module
 * Handles phonetic transliteration for Hindi and Bengali using Google Input Tools
 * Follows Single Responsibility Principle: Only manages transliteration
 */

export class Transliteration {
    constructor() {
        this.apiUrl = 'https://inputtools.google.com/request';
        this.currentLanguage = 'en';
        this.isTransliterating = false;
    }

    /**
     * Transliterate text to target language
     * @param {string} text - Input text in English
     * @param {string} languageCode - Target language code (hi, bn)
     * @returns {Promise<string>} Transliterated text
     */
    async transliterate(text, languageCode) {
        console.log('[Transliteration] Called with text:', text, 'language:', languageCode);
        
        if (!text || text.trim() === '') {
            console.log('[Transliteration] Empty text, returning as-is');
            return text;
        }

        // For English and other languages, return as-is
        if (languageCode === 'en' || languageCode === 'de' || languageCode === 'es') {
            console.log('[Transliteration] Non-transliteration language, returning as-is');
            return text;
        }

        // For Hindi and Bengali, use Google Input Tools
        try {
            console.log('[Transliteration] Starting Google Input Tools API call');
            this.isTransliterating = true;
            const result = await this.callGoogleInputTools(text, languageCode);
            this.isTransliterating = false;
            console.log('[Transliteration] API result:', result);
            return result;
        } catch (error) {
            console.error('[Transliteration] Error:', error);
            this.isTransliterating = false;
            return text; // Return original text on error
        }
    }

    /**
     * Call Google Input Tools API
     * @param {string} text - Input text
     * @param {string} languageCode - Language code
     * @returns {Promise<string>} Transliterated text
     */
    async callGoogleInputTools(text, languageCode) {
        const languageMap = {
            'hi': 'hi-t-i0-und', // Hindi
            'bn': 'bn-t-i0-und'  // Bengali
        };

        const targetLanguage = languageMap[languageCode];
        console.log('[API] Target language code:', targetLanguage);
        
        if (!targetLanguage) {
            console.log('[API] No target language found, returning original');
            return text;
        }

        const requestBody = {
            method: 'transliterate',
            params: {
                text: text,
                itc: targetLanguage,
                num: 5 // Number of suggestions
            }
        };

        console.log('[API] Request body:', JSON.stringify(requestBody));
        console.log('[API] Making request to:', this.apiUrl);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[API] Response status:', response.status);
            console.log('[API] Response ok:', response.ok);

            if (!response.ok) {
                throw new Error('API request failed with status: ' + response.status);
            }

            const data = await response.json();
            console.log('[API] Response data:', JSON.stringify(data));
            
            // Extract the best transliteration result
            if (data && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
                const result = data[1][0][1][0];
                console.log('[API] Extracted result:', result);
                return result;
            }

            console.log('[API] No result found in response, returning original');
            return text;
        } catch (error) {
            console.error('[API] Error:', error.message);
            console.error('[API] Full error:', error);
            return text;
        }
    }

    /**
     * Transliterate word by word for real-time typing
     * @param {string} text - Full text with cursor position
     * @param {string} languageCode - Target language
     * @returns {Promise<Object>} Result with transliterated text and cursor position
     */
    async transliterateWord(text, languageCode) {
        if (languageCode === 'en' || languageCode === 'de' || languageCode === 'es') {
            return { text: text, transliterated: false };
        }

        // Split into words
        const words = text.split(/(\s+)/);
        const lastWord = words[words.length - 1];

        // Only transliterate if last word ends with space or punctuation
        if (lastWord && /[a-zA-Z]$/.test(lastWord)) {
            // Still typing the word, don't transliterate yet
            return { text: text, transliterated: false };
        }

        // Transliterate the completed word
        if (words.length >= 2) {
            const wordToTransliterate = words[words.length - 2];
            if (/[a-zA-Z]+/.test(wordToTransliterate)) {
                const transliterated = await this.transliterate(wordToTransliterate, languageCode);
                words[words.length - 2] = transliterated;
                return { text: words.join(''), transliterated: true };
            }
        }

        return { text: text, transliterated: false };
    }

    /**
     * Check if currently transliterating
     * @returns {boolean}
     */
    isActive() {
        return this.isTransliterating;
    }

    /**
     * Set current language
     * @param {string} languageCode - Language code
     */
    setLanguage(languageCode) {
        this.currentLanguage = languageCode;
    }

    /**
     * Get current language
     * @returns {string}
     */
    getLanguage() {
        return this.currentLanguage;
    }
}
