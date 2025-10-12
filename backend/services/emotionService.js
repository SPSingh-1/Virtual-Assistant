class EmotionService {
    // Detect emotion from text
    detectEmotion(text) {
        const lowerText = text.toLowerCase();
        
        // Sad keywords
        const sadKeywords = ['sad', 'depressed', 'unhappy', 'crying', 'upset', 'disappointed', 
                            'dukhi', 'udaas', 'rona', 'pareshan', 'tension'];
        
        // Happy keywords
        const happyKeywords = ['happy', 'excited', 'joy', 'great', 'awesome', 'wonderful',
                              'khush', 'maza', 'accha', 'badiya', 'zabardast'];
        
        // Angry keywords
        const angryKeywords = ['angry', 'mad', 'furious', 'annoyed', 'hate', 'frustrated',
                              'gussa', 'naraz', 'chidna', 'irritate'];
        
        // Stressed keywords
        const stressedKeywords = ['stress', 'worried', 'anxious', 'nervous', 'pressure',
                                 'tension', 'chinta', 'ghabra', 'dar'];
        
        // Tired keywords
        const tiredKeywords = ['tired', 'exhausted', 'sleepy', 'fatigue', 'thaka', 'neend'];
        
        // Count matches
        let emotions = {
            sad: sadKeywords.filter(word => lowerText.includes(word)).length,
            happy: happyKeywords.filter(word => lowerText.includes(word)).length,
            angry: angryKeywords.filter(word => lowerText.includes(word)).length,
            stressed: stressedKeywords.filter(word => lowerText.includes(word)).length,
            tired: tiredKeywords.filter(word => lowerText.includes(word)).length,
            neutral: 0
        };

        // Find dominant emotion
        const maxEmotion = Object.keys(emotions).reduce((a, b) => 
            emotions[a] > emotions[b] ? a : b
        );

        return emotions[maxEmotion] > 0 ? maxEmotion : 'neutral';
    }

    // Get emotion-based response prefix
    getEmotionResponse(emotion, personality) {
        const responses = {
            sad: {
                friendly: "I'm sorry to hear that. ",
                professional: "I understand this is difficult. ",
                funny: "Aww, don't be sad! ",
                motivational: "Remember, tough times don't last but tough people do! ",
                sarcastic: "Oh no, anyway... just kidding! Let me help. "
            },
            happy: {
                friendly: "That's wonderful! I'm so happy for you! ",
                professional: "Excellent news. ",
                funny: "Woohoo! Party time! 🎉 ",
                motivational: "Keep that positive energy going! ",
                sarcastic: "Look at you, all happy and stuff! "
            },
            angry: {
                friendly: "I understand you're upset. Let's work through this calmly. ",
                professional: "I acknowledge your concerns. ",
                funny: "Deep breaths! Breathe in, breathe out. ",
                motivational: "Channel that energy into something productive! ",
                sarcastic: "Whoa there, tiger! "
            },
            stressed: {
                friendly: "Take it easy. I'm here to help. ",
                professional: "Let's address this systematically. ",
                funny: "Stress? Never heard of her! Let me help you relax. ",
                motivational: "You've got this! One step at a time. ",
                sarcastic: "Stress is just your body's way of saying you're alive! "
            },
            tired: {
                friendly: "You sound tired. Maybe take a break? ",
                professional: "I'll keep this brief. ",
                funny: "Coffee time? Or power nap? ",
                motivational: "Rest is productive too! Take care of yourself. ",
                sarcastic: "Tired? Welcome to adulthood! "
            },
            neutral: {
                friendly: "",
                professional: "",
                funny: "",
                motivational: "",
                sarcastic: ""
            }
        };

        return responses[emotion][personality] || "";
    }

    // Get emotion-based suggestions
    getEmotionSuggestion(emotion) {
        const suggestions = {
            sad: "Would you like to hear something uplifting? Or shall I play some relaxing music?",
            happy: "This energy is contagious! Want to share your happiness?",
            angry: "Would you like some breathing exercises or relaxing music?",
            stressed: "I can help you organize your tasks or play calming sounds.",
            tired: "Should I set a reminder for you to rest? Or play some energizing music?",
            neutral: ""
        };

        return suggestions[emotion] || "";
    }
}

export default new EmotionService();

