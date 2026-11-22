
import "dotenv/config";
import { MongoClient } from "mongodb";

const email = process.env.ADMIN_EMAIL;
const mongoURI = process.env.MONGODB_URI;

if (!email) {
  throw new Error("ADMIN_EMAIL is missing from .env");
}

if (!mongoURI) {
  throw new Error("MONGODB_URI is missing from .env");
}

const client = new MongoClient(mongoURI);

async function setAdminRole() {
  try {
    await client.connect();

    const db = client.db();
    const users = db.collection("user");

    const result = await users.updateOne(
      { email },
      {
        $set: {
          role: "admin",
          isBlocked: false,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log("User not found. No changes made.");
      return;
    }

    const updatedUser = await users.findOne(
      { email },
      {
        projection: {
          email: 1,
          role: 1,
          isBlocked: 1,
        },
      }
    );

    console.log("Admin account updated:");
    console.log(updatedUser);
  } catch (error) {
    console.error("Update failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

setAdminRole();
