import mongoose from "mongoose";

export const connectDB = async () => {
   try{
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/pesc-ar-app");
   } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
   }
    console.log("MongoDB connected successfully")
}  
