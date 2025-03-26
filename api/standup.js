import { App } from '@slack/bolt';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,        // Slack bot token
  signingSecret: process.env.SLACK_SIGNING_SECRET,  // Signing secret from .env
});

const channelId = process.env.SLACK_CHANNEL_ID;

async function sendStandupMessage() {
  await app.client.chat.postMessage({
    channel: channelId,
    text: "⏰ *Daily Standup Time!* ⏰\n\n1️⃣ What did you do yesterday?\n2️⃣ What will you do today?\n3️⃣ Any blockers?",
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await sendStandupMessage();
    return res.status(200).json({ message: 'Standup message sent!' });
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
