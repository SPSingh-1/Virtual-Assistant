import axios from 'axios';

class LanguageService {
    constructor() {
        this.translateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        this.translateUrl = 'https://translation.googleapis.com/language/translate/v2';
    }

    // Translate text
    async translate(text, targetLang) {
        try {
            // If Hinglish, don't translate
            if(targetLang === 'hinglish') {
                return text;
            }

            const response = await axios.post(`${this.translateUrl}?key=${this.translateApiKey}`, {
                q: text,
                target: targetLang,
                format: 'text'
            });

            return response.data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original if translation fails
        }
    }

    // Detect language
    async detectLanguage(text) {
        try {
            const response = await axios.post(
                `https://translation.googleapis.com/language/translate/v2/detect?key=${this.translateApiKey}`,
                { q: text }
            );
            return response.data.data.detections[0][0].language;
        } catch (error) {
            console.error('Language detection error:', error);
            return 'en';
        }
    }

    // Get language name
    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'hi': 'Hindi',
            'hinglish': 'Hinglish',
            'pa': 'Punjabi',
            'mr': 'Marathi',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'gu': 'Gujarati'
        };
        return languages[code] || 'English';
    }

    // Convert language code for speech synthesis
    getSpeechLang(code) {
        const speechLangs = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'hinglish': 'hi-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN',
            'bn': 'bn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'gu': 'gu-IN'
        };
        return speechLangs[code] || 'en-IN';
    }
}

export default new LanguageService();

