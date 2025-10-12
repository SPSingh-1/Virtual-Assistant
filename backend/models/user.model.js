import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    assistantName:{
        type:String,
    },
    assistantImage:{
        type:String,
    },
    learningMode:{
        type:Boolean,
        default:false,
    },
    // EXISTING FIELDS
    preferredLanguage:{
        type:String,
        enum:['en', 'hi', 'hinglish', 'pa', 'mr', 'bn', 'ta', 'te', 'gu'],
        default:'en'
    },
    personality:{
        type:String,
        enum:['professional', 'friendly', 'funny', 'motivational', 'sarcastic'],
        default:'friendly'
    },
    emotionDetection:{
        type:Boolean,
        default:true
    },
    // NEW FIELD - THEME
    theme:{
        type:String,
        enum:['dark', 'light', 'neon', 'sunset'],
        default:'dark'
    },
    history:[
        {type:String}
    ]
},{timestamps:true})

const User = mongoose.model("User", userSchema);

export default User;