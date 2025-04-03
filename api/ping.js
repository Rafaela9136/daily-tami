import { App } from "@slack/bolt";
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

    return res.status(200).json({ message: "Pong! Server is awake." });
  } catch (error) {
    console.error("Error handling /ping command:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
