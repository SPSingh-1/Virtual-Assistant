import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import geminiResponse from "../gemini.js";
import moment from "moment/moment.js";

export const getCurrentUser = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        return res.status(200).json({success: true, user});
    } catch (error) {
        return res.status(500).json({message: "getCurrentUser error"});
    }
}

export const updateAssistant = async(req, res) => {
    try {
        const {assistantName, assistantImage: imageUrl} = req.body;
        let assistantImage;
        
        if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path);
        } else if(imageUrl){
            assistantImage = imageUrl;
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName,
            assistantImage
        }, {new: true}).select("-password");
        
        return res.status(200).json({success: true, user});
    } catch (error) {
        return res.status(500).json({message: "updateAssistant error"});
    }
}

// Toggle Learning Mode
export const toggleLearningMode = async(req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.learningMode = !user.learningMode;
        await user.save();
        
        return res.status(200).json({
            success: true, 
            learningMode: user.learningMode,
            message: user.learningMode ? "Learning mode activated" : "Learning mode deactivated"
        });
    } catch (error) {
        return res.status(500).json({message: "toggleLearningMode error"});
    }
}

// Change Language
export const changeLanguage = async(req, res) => {
    try {
        const { language } = req.body;
        const validLanguages = ['en', 'hi', 'hinglish', 'pa', 'mr', 'bn', 'ta', 'te', 'gu'];
        
        if (!validLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language selected'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { preferredLanguage: language },
            { new: true }
        ).select("-password");
        
        return res.status(200).json({
            success: true,
            user,
            message: `Language changed to ${language}`
        });
    } catch (error) {
        return res.status(500).json({message: "changeLanguage error"});
    }
}

// Change Personality
export const changePersonality = async(req, res) => {
    try {
        const { personality } = req.body;
        const validPersonalities = ['professional', 'friendly', 'funny', 'motivational', 'sarcastic'];
        
        if (!validPersonalities.includes(personality)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid personality selected'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { personality: personality },
            { new: true }
        ).select("-password");
        
        return res.status(200).json({
            success: true,
            user,
            message: `Personality changed to ${personality}`
        });
    } catch (error) {
        return res.status(500).json({message: "changePersonality error"});
    }
}

// Toggle Emotion Detection
export const toggleEmotionDetection = async(req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.emotionDetection = !user.emotionDetection;
        await user.save();
        
        return res.status(200).json({
            success: true,
            emotionDetection: user.emotionDetection,
            message: user.emotionDetection ? "Emotion detection enabled" : "Emotion detection disabled"
        });
    } catch (error) {
        return res.status(500).json({message: "toggleEmotionDetection error"});
    }
}

// NEW: Change Theme
export const changeTheme = async(req, res) => {
    try {
        const { theme } = req.body;
        const validThemes = ['dark', 'light', 'neon', 'sunset'];
        
        if (!validThemes.includes(theme)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid theme selected'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            { theme: theme },
            { new: true }
        ).select("-password");
        
        return res.status(200).json({
            success: true,
            user,
            message: `Theme changed to ${theme}`
        });
    } catch (error) {
        console.error('Change theme error:', error);
        return res.status(500).json({
            success: false,
            message: "changeTheme error"
        });
    }
}

export const askToAssistant = async(req, res) => {
    try {
        const {command} = req.body;
        const user = await User.findById(req.userId);
        
        // Add to history
        user.history.push(command);
        await user.save();
        
        const userName = user.name;
        const assistantName = user.assistantName;
        
        // Prepare user settings
        const userSettings = {
            learningMode: user.learningMode,
            preferredLanguage: user.preferredLanguage,
            personality: user.personality,
            emotionDetection: user.emotionDetection,
            theme: user.theme
        };
        
        // Get AI response with all settings
        const result = await geminiResponse(command, assistantName, userName, userSettings);

        const jsonMatch = result.match(/{[\s\S]*}/);
        if(!jsonMatch){
            return res.status(400).json({
                response: "Sorry, I could not understand your request. Please try again.",
                user,
            });
        }
        
        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;

        // Handle learning mode toggle
        if(type === 'learning-mode-on'){
            user.learningMode = true;
            await user.save();
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: "Learning mode activated! I will now help you improve your English.",
                learningFeedback: "",
                emotion: gemResult.emotion || "neutral",
                confidence: 100
            });
        }

        if(type === 'learning-mode-off'){
            user.learningMode = false;
            await user.save();
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: "Learning mode deactivated. Back to normal mode.",
                learningFeedback: "",
                emotion: gemResult.emotion || "neutral",
                confidence: 100
            });
        }

        // Handle language change
        if(type === 'change-language'){
            const langMap = {
                'hindi': 'hi',
                'english': 'en',
                'hinglish': 'hinglish',
                'punjabi': 'pa',
                'marathi': 'mr',
                'bengali': 'bn',
                'tamil': 'ta',
                'telugu': 'te',
                'gujarati': 'gu'
            };
            
            const detectedLang = Object.keys(langMap).find(lang => 
                gemResult.userInput.toLowerCase().includes(lang)
            );
            
            if(detectedLang) {
                user.preferredLanguage = langMap[detectedLang];
                await user.save();
            }
            
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: gemResult.response,
                learningFeedback: "",
                emotion: gemResult.emotion || "neutral",
                confidence: 100
            });
        }

        // Handle personality change
        if(type === 'change-personality'){
            const personalities = ['professional', 'friendly', 'funny', 'motivational', 'sarcastic'];
            const detectedPersonality = personalities.find(p => 
                gemResult.userInput.toLowerCase().includes(p)
            );
            
            if(detectedPersonality) {
                user.personality = detectedPersonality;
                await user.save();
            }
            
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: gemResult.response,
                learningFeedback: "",
                emotion: gemResult.emotion || "neutral",
                confidence: 100
            });
        }

        // Handle theme change
        if(type === 'change-theme'){
            const themes = ['dark', 'light', 'neon', 'sunset'];
            const detectedTheme = themes.find(t => 
                gemResult.userInput.toLowerCase().includes(t)
            );
            
            if(detectedTheme) {
                user.theme = detectedTheme;
                await user.save();
            }
            
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: gemResult.response,
                learningFeedback: "",
                emotion: gemResult.emotion || "neutral",
                confidence: 100
            });
        }

        // Handle time/date queries
        switch(type){
            case 'get-date': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current date is ${moment().format("DD-MM-YYYY")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-time': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current time is ${moment().format("hh:mm A")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-day': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-month': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current month is ${moment().format("MMMM")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-year': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current year is ${moment().format("YYYY")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100
                });
            
            // All other types
            default:
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                    learningFeedback: gemResult.learningFeedback || "",
                    emotion: gemResult.emotion || "neutral",
                    confidence: gemResult.confidence || 100,
                    user,
                });
        }

    } catch (error) {
        console.error("askToAssistant error:", error);
        return res.status(500).json({message: "askToAssistant error"});
    }
}