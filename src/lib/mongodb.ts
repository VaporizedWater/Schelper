import { MongoClient } from "mongodb";
import { DB_URI } from "@/lib/envConfig";

const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let client;
let clientPromise: Promise<MongoClient>;

if (!DB_URI) {
    throw new Error("Please define the DB_URI environment variable");
}

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(DB_URI, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    client = new MongoClient(DB_URI, options);
    clientPromise = client.connect().catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    });
}

// Add a connection validator
export const validateConnection = async () => {
    try {
        const client = await clientPromise;
        await client.db().command({ ping: 1 });
        return true;
    } catch (err) {
        console.error("MongoDB connection validation failed:", err);
        return false;
    }
};

export default clientPromise;
