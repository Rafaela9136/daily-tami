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
  console.log("Received payload:", JSON.stringify(payload, null, 2));

  try {
    // Handle Modal Submission
    if (payload.type === 'view_submission' && payload.view.callback_id === 'standup_modal') {
      console.log("entrei no view_submission")

      let selectedUsers = [];
      let selectedChannel = null;

      // Loop through dynamic keys in values
      const values = payload.view.state.values;
      for (const blockId in values) {
        const actions = values[blockId];

        for (const actionId in actions) {
          const action = actions[actionId];

          if (action.type === 'multi_users_select' && action.selected_users) {
            selectedUsers = action.selected_users;
          }
          if (action.type === 'conversations_select' && action.selected_conversation) {
            selectedChannel = action.selected_conversation;
          }
        }
      }

      console.log("Users selected:", selectedUsers);
      console.log("Channel selected:", selectedChannel);

      if (!selectedUsers.length || !selectedChannel) {
        return res.status(400).json({ error: "Missing users or channel" });
      }

      // Save to Firestore
      await db.collection('standups').doc('current').set({
        users: selectedUsers,
        channel: selectedChannel
      });

      await app.client.views.update({
        view_id: payload.view.id,
        view: {
          type: 'modal',
          title: { type: 'plain_text', text: 'Standup Confirmed' },
          blocks: [{ type: 'section', text: { type: 'mrkdwn', text: "Standup participants saved!" } }]
        }
      });
      
      console.log('Users stored successfully!');
      res.status(200).send();
      return;
    }

    // Handle button click -> Open Modal
    if (payload.type === "block_actions" && payload.actions[0].action_id === "open_standup_modal") {
      await app.client.views.open({
        trigger_id: payload.trigger_id,
        view: {
          type: "modal",
          callback_id: "user_standup_modal",
          title: { type: "plain_text", text: "Standup Report" },
          submit: { type: "plain_text", text: "Submit" },
          blocks: [
            {
              type: "input",
              block_id: "question_1",
              label: { type: "plain_text", text: "✨ O que fez desde a última daily?" },
              element: { type: "plain_text_input", action_id: "answer_1" }
            },
            {
              type: "input",
              block_id: "question_2",
              label: { type: "plain_text", text: "💡 O que vai fazer hoje?" },
              element: { type: "plain_text_input", action_id: "answer_2" }
            },
            {
              type: "input",
              block_id: "question_3",
              label: { type: "plain_text", text: "⚡️ Bloqueios?" },
              element: { type: "plain_text_input", action_id: "answer_3" }
            }
          ]
        }
      });

      console.log("✅ Modal Opened!");
      return res.status(200).send("OK");
    }

    // Handle modal submission -> Send to selected channel
    if (payload.type === "view_submission" && payload.view.callback_id === "user_standup_modal") {
      const userId = payload.user.id;
      const values = payload.view.state.values;

      const answers = {
        yesterday: values.question_1.answer_1.value,
        today: values.question_2.answer_2.value,
        blockers: values.question_3.answer_3.value,
      };

      const message = `🚀 <@${userId}> compartilhou sua daily:\n\n✨ *O que fez desde a última daily?*\n${answers.yesterday}\n💡 *O que vai fazer hoje?*\n${answers.today}\n⚡️ *Bloqueios?*\n${answers.blockers}`;
      console.log(message)

      // Fetch users & channel from Firestore
      const standupData = await db.collection('standups').doc('current').get();

      if (!standupData.exists) {
        return res.status(400).json({ message: "No standup configuration found." });
      }

      const { users, channel } = standupData.data();

      console.log("Triggering standup for users:", users);
      console.log("Triggering standup for channel:", channel);

      await app.client.chat.postMessage({
        channel: channel, // Send to the standup channel
        text: message
      });

      console.log("✅ Standup response sent!");
      res.status(200).send();
      return;
    }

    console.log("⚠️ Unhandled payload type:", payload.type);
    return res.status(400).json({ error: "Unhandled event type" });
  } catch (error) {
    console.error('Error triggering standup:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}