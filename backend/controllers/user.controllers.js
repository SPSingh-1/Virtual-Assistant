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

// NEW: Toggle Learning Mode
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

export const askToAssistant = async(req, res) => {
    try {
        const {command} = req.body;
        const user = await User.findById(req.userId);
        
        // Add to history
        user.history.push(command);
        await user.save();
        
        const userName = user.name;
        const assistantName = user.assistantName;
        const learningMode = user.learningMode;
        
        // Get AI response with learning mode status
        const result = await geminiResponse(command, assistantName, userName, learningMode);

        const jsonMatch = result.match(/{[\s\S]*}/);
        if(!jsonMatch){
            return res.status(400).json({
                response: "Sorry, I could not understand your request. Please try again.",
                user,
            });
        }
        
        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;

        // Handle learning mode toggle commands
        if(type === 'learning-mode-on'){
            user.learningMode = true;
            await user.save();
            return res.json({
                type,
                userInput: gemResult.userInput,
                response: "Learning mode activated! I will now help you improve your English.",
                learningFeedback: "",
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
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-time': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current time is ${moment().format("hh:mm A")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-day': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-month': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current month is ${moment().format("MMMM")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    confidence: gemResult.confidence || 100
                });
            
            case 'get-year': 
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current year is ${moment().format("YYYY")}`,
                    learningFeedback: gemResult.learningFeedback || "",
                    confidence: gemResult.confidence || 100
                });
            
            // All other types
            case 'calculator-open': 
            case 'instagram-open':
            case 'facebook-open':
            case 'twitter-open':
            case 'whatsapp-open':
            case 'google-search':  
            case 'google-open':
            case 'youtube-search':  
            case 'youtube-play':
            case 'youtube-open':
            case 'get-weather':
            case 'get-news':
            case 'get-joke':
            case 'get-quote':
            case 'get-fact':
            case 'get-story':
            case 'open-website':
            case 'open-app':
            case 'close-app':
            case 'set-reminder':
            case 'set-alarm':
            case 'set-timer':
            case 'calculate':
            case 'translate':
            case 'spell-check':
            case 'define-word':
            case 'synonyms':
            case 'antonyms':
            case 'history-facts':
            case 'science-facts':
            case 'math-facts':
            case 'tech-facts':
            case 'geography-facts':
            case 'general':
            case 'conversation':
            case 'tell-about-yourself':
            case 'play-music':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                    learningFeedback: gemResult.learningFeedback || "",
                    confidence: gemResult.confidence || 100,
                    user,
                });
            
            default: 
                return res.json({
                    response: "Sorry, I could not understand your request. Please try again.",
                    learningFeedback: "",
                    confidence: 0
                });
        }

    } catch (error) {
        console.error("askToAssistant error:", error);
        return res.status(500).json({message: "askToAssistant error"});
    }
}