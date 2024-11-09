import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async (): Promise<void> => {
    mongoose.set("strictQuery", true);

    const mongoURI = process.env.NEXT_MONGODB_URI;
    if (!mongoURI) {
        throw new Error(
            "Environment variable NEXT_MONGODB_URI is not defined."
        );
    }

    if (isConnected) {
        console.log("=> Using existing database connection");
        return;
    }

    try {
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log("MongoDB connected successfully.");
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                `MongoDB connection error: ${error.name} - ${error.message}`
            );
        } else {
            console.error(
                "An unknown error occurred while connecting to MongoDB."
            );
        }
    }
};
