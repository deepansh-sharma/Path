import mongoose from "mongoose";

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI not set");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      dbName: undefined, // use database from URI
    });
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err.message);
    throw err;
  }

  // Basic connection event logs
  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    // eslint-disable-next-line no-console
    console.log("MongoDB reconnected");
  });
}
