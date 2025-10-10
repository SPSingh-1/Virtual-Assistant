import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import geminiResponse from "../gemini.js";
import moment from "moment/moment.js";
export const getCurrentUser=async(req,res)=>{
    try {
        const userId=req.userId;
        const user=await User.findById(userId).select("-password");
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        return res.status(200).json({success:true,user});
    } catch (error) {
        return res.status(500).json({message:"getCurrentUser error"});
    }
}

export const updateAssistant=async(req,res)=>{
    try {
         const {assistantName,assistantImage: imageUrl}= req.body;
         let assistantImage;
            if(req.file){
                assistantImage=await uploadOnCloudinary(req.file.path);
            }else if(imageUrl){
                assistantImage=imageUrl;
            }

            const user=await User.findByIdAndUpdate(req.userId,{
                assistantName,
                assistantImage
            },{new:true}).select("-password");
            return res.status(200).json({success:true,user});
    } catch (error) {
        return res.status(500).json({message:"updateAssistant error"});
    }
}


export const askToAssistant = async (req,res)=>{
    try {
            const {command}=req.body;
         const user = await User.findById(req.userId);
         user.history.push(command)
         await user.save();
         const userName=user.name;
         const assistantName=user.assistantName;
        const result=await geminiResponse(command,assistantName,userName);

        const jsonMatch=result.match(/{[\s\S]*}/);
        if(!jsonMatch){
             return res.status(400).json({response:"Sorry, I could not understand your request. Please try again.",user,});
        }
        const gemResult=JSON.parse(jsonMatch[0]);
        const type=gemResult.type;

        switch(type){
            case 'get-date': return res.json({
                type,
                userInput:gemResult.userInput,
                response:`current date is ${moment().format("DD-MM-YYYY")}`
            });
            case 'get-time': return res.json({
                type,
                userInput:gemResult.userInput,
                response:`current time is ${moment().format("hh:mm A")}`
            });
            case 'get-day': return res.json({
                type,
                userInput:gemResult.userInput,
                response:`today time is ${moment().format("dddd")}`
            });
            case 'get-month': return res.json({
                type,
                userInput:gemResult.userInput,
                response:`today time is ${moment().format("MMMM")}`
            });
            case 'calculator-open': 
            case 'instagram-open':
            case 'facebook-open':
            case 'google-search':  
            case 'youtube-search':  
            case 'youtube-play':
            case 'youtube-open':
            case 'get-weather':
            case 'get-news':
            case 'get-joke':
            case 'get-quote':
            case 'get-fact':
            case 'open-website':
            case 'open-app':
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
            case 'google-search':
            case 'google-open':
            case 'geography-facts':
            case 'general':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:gemResult.response,
                    user,
                })
            default: return res.json({response:"Sorry, I could not understand your request. Please try again."});
        }

    } catch (error) {
        return res.status(500).json({message:"askToAssistant error"});
    }
}