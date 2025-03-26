import { App } from '@slack/bolt';
require('dotenv').config(); // Load env variables

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command('/standup', async ({ command, ack, client }) => {
  await ack(); // Acknowledge immediately

  try {
    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'standup_modal',
        title: { type: 'plain_text', text: 'Standup Meeting' },
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: 'Select participants for the standup.' },
            accessory: {
              type: 'multi_users_select',
              action_id: 'users_select'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});