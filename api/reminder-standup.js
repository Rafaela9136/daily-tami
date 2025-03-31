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
        text: "Ainda não registrou sua resposta? 👀 Seu time conta com você! 🧡",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Ainda não registrou sua resposta? 👀 Seu time conta com você! 🧡"
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
    }

    console.log("Standup messages sent!");
    return res.status(200).json({ message: "Standup messages sent successfully!" });
  } catch (error) {
    console.error('Error triggering standup:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

app.action('open_standup_modal', async ({ body, ack, client }) => {
  console.log("📩 Received button click event!");

  await ack(); // ✅ Acknowledge first

  console.log("✅ Action acknowledged!");
  console.log("🔍 Full Payload:", JSON.stringify(body, null, 2));

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "standup_submission",
        title: { type: "plain_text", text: "Standup Report" },
        submit: { type: "plain_text", text: "Submit" },
        blocks: [
          {
            type: "input",
            block_id: "question_1",
            label: { type: "plain_text", text: "What did you do yesterday?" },
            element: { type: "plain_text_input", action_id: "answer_1" }
          },
          {
            type: "input",
            block_id: "question_2",
            label: { type: "plain_text", text: "What will you do today?" },
            element: { type: "plain_text_input", action_id: "answer_2" }
          },
          {
            type: "input",
            block_id: "question_3",
            label: { type: "plain_text", text: "Any blockers?" },
            element: { type: "plain_text_input", action_id: "answer_3" }
          }
        ]
      }
    });
  } catch (error) {
    console.error("Error opening standup modal:", error);
  }
});
