import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const signUp = async (req,res) =>{
    try {
        const {name, email, password} = req.body;

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message:"Email already exists !"});
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters long !"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashPassword,
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:10 * 24 * 60 * 60 * 1000, // 10 days
        });

        res.status(201).json({message:"User created successfully", user, token});
    } catch(error){
        return res.status(500).json({message:"Error in user creation", error});
    }
};

const Login = async (req,res) =>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Email does not exist !"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password !"});
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:10 * 24 * 60 * 60 * 1000, // 10 days
        });

        res.status(200).json({message:"Login successful", user, token});
    } catch(error){
        return res.status(500).json({message:"Login Error", error});
    }
};

export const Logout = async (req,res) =>{
    try {
        res.clearCookie("token");
        res.status(200).json({message:"Logout Successfully"});
    } catch (error) {
        return res.status(500).json({message:"Logout Error", error});
    }
};

export { signUp, Login };
