import { App } from "@slack/bolt";
import { db } from '../firebase';
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Received /ping command from:", req.body.user_id);

    // Fetch users & channel from Firestore
    const standupData = await db.collection('standups').doc('current').get();

    if (!standupData.exists) {
      return res.status(400).json({ message: "No standup configuration found." });
    }

    const { users, channel } = standupData.data();

    console.log("Triggering standup for users:", users);
    console.log("Triggering standup for channel:", channel);

    for (const user of users) {
      console.log("Standup message sent for user:", user);
    }

    return res.status(200).json({ message: "Pong! Server is awake." });
  } catch (error) {
    console.error("Error handling /ping command:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
