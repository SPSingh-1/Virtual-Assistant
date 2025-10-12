import axios from 'axios';
import languageService from './services/languageService.js';
import emotionService from './services/emotionService.js';

// API Key Manager Class with Smart Recovery
class GeminiAPIManager {
    constructor() {
        this.apiKeys = this.loadAPIKeys();
        this.currentKeyIndex = 0;
        this.keyStatus = new Array(this.apiKeys.length).fill(null).map(() => ({
            active: true,
            exhaustedAt: null
        }));
        this.resetInterval = 60 * 60 * 1000; // 1 hour
        console.log(`✅ Loaded ${this.apiKeys.length} Gemini API key(s)`);
    }

    loadAPIKeys() {
        const keys = [];
        let i = 1;
        
        while (process.env[`GEMINI_API_KEY_${i}`]) {
            keys.push(process.env[`GEMINI_API_KEY_${i}`]);
            i++;
        }
        
        if (keys.length === 0 && process.env.GEMINI_API_URL) {
            const urlMatch = process.env.GEMINI_API_URL.match(/key=([^&]+)/);
            if (urlMatch) {
                keys.push(urlMatch[1]);
            }
        }
        
        if (keys.length === 0) {
            throw new Error('❌ No Gemini API keys found!');
        }
        
        return keys;
    }

    getCurrentAPIUrl() {
        const key = this.apiKeys[this.currentKeyIndex];
        return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    }

    // Check if key has recovered (1 hour passed)
    hasKeyRecovered(keyIndex) {
        const status = this.keyStatus[keyIndex];
        if (status.active) return true;
        if (!status.exhaustedAt) return true;
        
        const timePassed = Date.now() - status.exhaustedAt;
        return timePassed >= this.resetInterval;
    }

    // Find next available key (check recovery first)
    findNextAvailableKey() {
        // First check if Key 1 has recovered
        if (this.currentKeyIndex !== 0 && this.hasKeyRecovered(0)) {
            console.log(`✅ Key #1 recovered! Switching back to Key #1`);
            this.keyStatus[0].active = true;
            this.keyStatus[0].exhaustedAt = null;
            return 0;
        }

        // Then check other keys in order
        for (let i = 0; i < this.apiKeys.length; i++) {
            if (i === this.currentKeyIndex) continue;
            
            if (this.hasKeyRecovered(i)) {
                if (!this.keyStatus[i].active) {
                    console.log(`✅ Key #${i + 1} recovered!`);
                    this.keyStatus[i].active = true;
                    this.keyStatus[i].exhaustedAt = null;
                }
                return i;
            }
        }

        return -1; // No key available
    }

    async makeRequest(payload) {
        let attempts = 0;
        const maxAttempts = this.apiKeys.length * 2; // Extra attempts for recovery

        while (attempts < maxAttempts) {
            try {
                const url = this.getCurrentAPIUrl();
                const response = await axios.post(url, payload);
                
                // Success! Return data
                return response.data;

            } catch (error) {
                const status = error.response?.status;
                const errorData = error.response?.data;
                const errorMessage = errorData?.error?.message || '';

                // Check if rate limit error
                const isRateLimit = 
                    status === 429 || 
                    errorData?.error?.code === 429 ||
                    errorData?.error?.status === 'RESOURCE_EXHAUSTED' ||
                    errorMessage.includes('quota') ||
                    errorMessage.includes('rate limit');

                if (isRateLimit) {
                    // Mark current key as exhausted
                    this.keyStatus[this.currentKeyIndex].active = false;
                    this.keyStatus[this.currentKeyIndex].exhaustedAt = Date.now();
                    
                    console.log(`⚠️ Key #${this.currentKeyIndex + 1} exhausted, finding next...`);

                    // Find next available key
                    const nextKeyIndex = this.findNextAvailableKey();
                    
                    if (nextKeyIndex !== -1) {
                        this.currentKeyIndex = nextKeyIndex;
                        console.log(`🔄 Switched to Key #${this.currentKeyIndex + 1}`);
                        attempts++;
                        continue; // Try again with new key
                    } else {
                        // All keys exhausted
                        const oldestKey = this.keyStatus.reduce((oldest, current, index) => {
                            if (!current.exhaustedAt) return oldest;
                            if (!oldest.exhaustedAt) return current;
                            return current.exhaustedAt < oldest.exhaustedAt ? current : oldest;
                        }, this.keyStatus[0]);
                        
                        const waitTime = oldestKey.exhaustedAt ? 
                            Math.ceil((this.resetInterval - (Date.now() - oldestKey.exhaustedAt)) / 60000) : 
                            60;
                        
                        throw new Error(`All API keys exhausted. Please wait ${waitTime} minutes.`);
                    }
                }

                // Other errors
                console.error(`❌ API Error:`, errorMessage);
                throw error;
            }
        }

        throw new Error('Maximum retry attempts reached');
    }
}

// Create singleton instance
const geminiManager = new GeminiAPIManager();

const geminiResponse = async(command, assistantName, userName, userSettings) => {
    try {
        const { learningMode, preferredLanguage, personality, emotionDetection } = userSettings;
        
        // Detect emotion if enabled
        let emotion = 'neutral';
        let emotionPrefix = '';
        let emotionSuggestion = '';
        
        if(emotionDetection) {
            emotion = emotionService.detectEmotion(command);
            emotionPrefix = emotionService.getEmotionResponse(emotion, personality);
            emotionSuggestion = emotionService.getEmotionSuggestion(emotion);
        }

        // Personality descriptions
        const personalityInstructions = {
            professional: "Be formal, concise, and business-like. Use professional language.",
            friendly: "Be warm, casual, and approachable. Like talking to a good friend.",
            funny: "Be humorous, witty, and entertaining. Make jokes when appropriate.",
            motivational: "Be inspiring, encouraging, and positive. Motivate the user.",
            sarcastic: "Be witty with gentle sarcasm. Keep it fun, not mean."
        };

        const languageName = languageService.getLanguageName(preferredLanguage);
        
        const prompt = `You are a virtual assistant named ${assistantName}. I was created by ${userName}.

PERSONALITY MODE: ${personality.toUpperCase()}
${personalityInstructions[personality]}

PREFERRED LANGUAGE: ${languageName}
- Respond primarily in ${languageName}
- If ${languageName} is "Hinglish", mix Hindi and English naturally (like: "Aap ka kaam done hai")
- Keep natural flow and cultural context

EMOTION DETECTED: ${emotion.toUpperCase()}
${emotionPrefix ? `Start response with: "${emotionPrefix}"` : ''}
${emotionSuggestion ? `Suggest: "${emotionSuggestion}"` : ''}

LEARNING MODE STATUS: ${learningMode ? 'ENABLED' : 'DISABLED'}

Your task is to understand the user's natural language input and respond with a JSON object like this:
{
  "type": "<intent-type>",
  "userInput": "<processed-input>",
  "response": "<voice-friendly-response>",
  "learningFeedback": "<correction-in-hindi>",
  "emotion": "${emotion}",
  "confidence": <0-100>
}

AVAILABLE TYPES:
"general" | "google-search" | "youtube-search" | "youtube-play" | "youtube-open" | 
"google-open" | "get-time" | "get-date" | "get-day" | "get-month" | "get-year" |
"calculator-open" | "instagram-open" | "facebook-open" | "twitter-open" | "whatsapp-open" |
"get-weather" | "get-news" | "get-joke" | "get-quote" | "get-fact" | "get-story" |
"open-website" | "open-app" | "close-app" | "set-reminder" | "set-alarm" | "set-timer" |
"calculate" | "translate" | "spell-check" | "define-word" | "synonyms" | "antonyms" |
"history-facts" | "science-facts" | "math-facts" | "geography-facts" | "tech-facts" |
"play-music" | "learning-mode-on" | "learning-mode-off" | "change-language" | 
"change-personality" | "conversation" | "tell-about-yourself"

RESPONSE GUIDELINES:
1. Match the personality style in your response
2. Use the preferred language
3. If emotion detected, address it appropriately
4. Keep responses 30-40 words for voice
5. Be natural and conversational

PERSONALITY EXAMPLES:

Professional: "Good morning. The current time is 10:30 AM. Is there anything else I can assist you with?"
Friendly: "Hey! It's 10:30 AM right now. What else can I help you with?"
Funny: "It's 10:30! Time flies when you're having fun... or maybe you just need a new watch! 😄"
Motivational: "It's 10:30 AM - a perfect time to conquer your goals! You've got this!"
Sarcastic: "Oh look, it's 10:30. Surprised? Yeah, time keeps moving. Shocking, I know!"

LANGUAGE EXAMPLES:

English: "The weather today is sunny with a temperature of 28 degrees."
Hindi: "Aaj ka mausam dhoop wala hai aur tapman 28 degree hai."
Hinglish: "Aaj ka weather sunny hai, temperature 28 degrees hai."

LEARNING MODE (only if enabled):
- Correct English grammar errors
- Provide feedback in Hindi
- Be encouraging

IMPORTANT:
- Always respond in valid JSON format
- Include emotion field
- Match personality in tone
- Use preferred language
- Be culturally appropriate

Now process this user input: ${command}

Respond ONLY with the JSON object, nothing else.`;

        // Use API manager - handles rotation automatically
        const result = await geminiManager.makeRequest({
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        });

        let responseText = result.candidates[0].content.parts[0].text;
        
        // Parse JSON response
        const jsonMatch = responseText.match(/{[\s\S]*}/);
        if(jsonMatch) {
            const parsedResponse = JSON.parse(jsonMatch[0]);
            
            // Translate response if needed
            if(preferredLanguage !== 'en' && preferredLanguage !== 'hinglish') {
                parsedResponse.response = await languageService.translate(
                    parsedResponse.response, 
                    preferredLanguage
                );
            }
            
            return JSON.stringify(parsedResponse);
        }

        return responseText;
    } catch (error) {
        console.log("❌ Error in geminiResponse:", error.message);
        throw error;
    }
}

export default geminiResponse;