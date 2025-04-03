import { App } from '@slack/bolt';
import { db } from '../firebase';
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log("📩 Received payload:", req.body.user_id);

    // Fetch users & channel from Firestore
    const standupData = await db.collection('standups').doc('current').get();

    if (!standupData.exists) {
      return res.status(400).json({ message: "No standup configuration found." });
    }

    const { users, channel } = standupData.data();

    console.log("Triggering standup for users:", users);
    console.log("Triggering standup for channel:", channel);

    // Send message to each user
    for (const user of users) {
      await app.client.chat.postMessage({
        channel: user,
        text: "👋 Bom dia! Está na hora da daily! ⏰\n\nEntre na chamada por voz ou clique no botão abaixo para participar por texto.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "👋 Bom dia! Está na hora da daily! ⏰\n\nEntre na chamada por voz ou clique no botão abaixo para participar por texto."
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Responder Daily"
                },
                action_id: "open_standup_modal"
              }
            ]
          }
        ]
      });

      console.log("Standup message sent for user:", user);
    }

    console.log("Standup messages sent!");
    return res.status(200).json({ message: "Standup messages sent successfully!" });
  } catch (error) {
    console.error('Error triggering standup:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}