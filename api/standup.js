import { App } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
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
