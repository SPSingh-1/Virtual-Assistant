import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MoNGODB_URL)
        console.log("MongoDB connected")
    }catch(error){
        console.log("Error in DB connection", error)
    }
}

export default connectDB;