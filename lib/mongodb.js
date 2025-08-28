// lib/mongodb.js
import { MongoClient } from "mongodb";

// Retrieve MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Throw an error if the URI is not defined
if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in your .env.local file"
  );
}

// Define options for the MongoDB client
const options = {};

let client;
let clientPromise;

// In development mode, use a global variable to preserve the client across module reloads
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, do not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the client promise
export default clientPromise;
