import dotenv from 'dotenv'
import mongoose, { mongo } from 'mongoose';

dotenv.config();

const MONGO_URI: string | undefined = process.env.MONGO_URI;

export const connectDB = async (): Promise<void> => {
    if(!MONGO_URI) {
        console.error("MONGO_URI is not defined in environment variables.");
        // Terminate the process due to a non-recoverable error
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);

        // Monitor error handling globally
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err.message}`);
        });
    } catch (error) {
        let errorMessage = "Database connection failed.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = String(error);
        }
        
        console.error(`💥 DB Connection Error: ${errorMessage}`);
        
        // Terminate the process due to a non-recoverable error
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected.");
    } catch (error) {
        console.error("Error disconnecting MongoDB:", error);
    }
}