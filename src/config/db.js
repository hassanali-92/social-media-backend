import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 🌐 process.env.MONGO_URI automatic .env file se cloud ya local ka link utha lega
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`📡 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Agar database connect na ho, toh server ko crash hone se bachane ke liye process exit kar dein
    process.exit(1);
  }
};

export default connectDB;