import mongoose from "mongoose";    
 const connectDB = async () => {
try { 
    await mongoose.connect(`${process.env.MONGO_URI}/Ekart yt`)
    console.log("mongodb connected Successfully");

} catch (error) {
    console.log("mongodb",error);
}
 }

 export default connectDB;