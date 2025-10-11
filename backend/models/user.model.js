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
        default:false,  // Learning mode OFF by default
    },
    history:[
        {type:String}
    ]
},{timestamps:true})

const User = mongoose.model("User", userSchema);

export default User;