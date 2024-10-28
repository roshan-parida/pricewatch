import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
	mongoose.set("strictQuery", true);

	if (!process.env.NEXT_MONGODB_URI)
		return console.log("MONGODB_URI is not defined");

	if (isConnected)
		return console.log("=> using existing database connection");

	try {
		await mongoose.connect(process.env.NEXT_MONGODB_URI);

		isConnected = true;

		console.log("MongoDB Connected");
	} catch (error) {
		console.log(error);
	}
};
