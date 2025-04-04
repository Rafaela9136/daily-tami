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

  const payload = req.body.payload ? (typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body.payload) : req.body;
  console.log("📩 Received payload:", JSON.stringify(payload, null, 2));

  try {
    console.log("Received /setup-standup command from:", payload.user_id);

    if (!payload.trigger_id) {
      console.error("Missing trigger_id in request");
      return res.status(400).json({ message: "Missing trigger_id" });
    }

    // Open the modal using trigger_id
    await app.client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: 'standup_modal',
        title: { type: "plain_text", text: "Configure a daily" },
        blocks: [
          {
            type: "input",
            block_id: "channel_select",
            label: {
              type: "plain_text",
              text: "Select a channel for the standup"
            },
            element: {
              type: "conversations_select",
              action_id: "select_standup_channel",
              placeholder: {
                type: "plain_text",
                text: "Select a channel..."
              },
              filter: {
                include: ["public", "private"]
              }
            }
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: 'Select participants for the standup' },
            accessory: {
              type: 'multi_users_select',
              action_id: 'users_select',
              placeholder: { type: 'plain_text', text: 'Select users' }
            }
          }
        ],
        close: {
          type: "plain_text",
          text: "Cancel"
        },
        submit: {
          type: "plain_text",
          text: "Save"
        }
      }
    });

    console.log("Modal opened successfully!");
    res.status(200).send();
    return;
  } catch (error) {
    console.error('Error handling /setup-standup command:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}