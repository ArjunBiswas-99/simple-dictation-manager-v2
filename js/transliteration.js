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

        // Extract special characters and their positions
        const specialChars = this.extractSpecialCharacters(text);
        console.log('[API] Special characters found:', specialChars);

        // Correct Google Input Tools API format
        const requestBody = [
            [
                'ds',
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                [text, targetLanguage, null, 1]
            ]
        ];

        console.log('[API] Request body:', JSON.stringify(requestBody));
        console.log('[API] Making request to:', this.apiUrl);

        try {
            const response = await fetch(this.apiUrl + '?ime=transliteration&component=proactive&text=' + encodeURIComponent(text) + '&itc=' + targetLanguage, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            console.log('[API] Response status:', response.status);
            console.log('[API] Response ok:', response.ok);

            if (!response.ok) {
                throw new Error('API request failed with status: ' + response.status);
            }

            const data = await response.json();
            console.log('[API] Response data:', JSON.stringify(data));
            
            // Extract ALL transliteration segments
            if (data && data[1] && Array.isArray(data[1])) {
                const segments = [];
                
                // Loop through all segments in the response
                for (const segment of data[1]) {
                    if (segment && segment[1] && segment[1][0]) {
                        segments.push(segment[1][0]);
                        console.log('[API] Extracted segment:', segment[1][0]);
                    }
                }
                
                if (segments.length > 0) {
                    // Join all segments
                    let result = segments.join('');
                    console.log('[API] Combined segments:', result);
                    
                    // Re-insert special characters
                    result = this.reinsertSpecialCharacters(result, specialChars, text);
                    console.log('[API] Final result with special chars:', result);
                    
                    return result;
                }
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
     * Extract special characters and their positions from text
     * @param {string} text - Input text
     * @returns {Array} Array of {char, position} objects
     */
    extractSpecialCharacters(text) {
        const specialChars = [];
        const specialCharRegex = /[^a-zA-Z\s\u0900-\u097F\u0980-\u09FF]/g;
        let match;
        
        while ((match = specialCharRegex.exec(text)) !== null) {
            specialChars.push({
                char: match[0],
                position: match.index,
                // Count words before this position
                wordPosition: text.substring(0, match.index).trim().split(/\s+/).filter(w => w).length
            });
        }
        
        return specialChars;
    }

    /**
     * Reinsert special characters into transliterated text
     * @param {string} transliterated - Transliterated text
     * @param {Array} specialChars - Array of special character objects
     * @param {string} originalText - Original text for reference
     * @returns {string} Text with special characters reinserted
     */
    reinsertSpecialCharacters(transliterated, specialChars, originalText) {
        if (specialChars.length === 0) {
            return transliterated;
        }

        // Try to match positions based on word count
        const transliteratedWords = transliterated.split(/\s+/).filter(w => w);
        let result = transliterated;
        
        // Insert special characters at appropriate positions
        for (const special of specialChars.reverse()) {
            // If special char was at end of a word, append it
            if (special.wordPosition < transliteratedWords.length) {
                const wordIndex = special.wordPosition;
                const words = result.split(/\s+/).filter(w => w);
                
                if (wordIndex < words.length) {
                    words[wordIndex] = words[wordIndex] + special.char;
                    result = words.join(' ');
                }
            } else {
                // Append at end
                result += special.char;
            }
        }
        
        return result;
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
