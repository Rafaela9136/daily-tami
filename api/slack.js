import { App } from '@slack/bolt';
require('dotenv').config(); // Load env variables

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Acknowledge Slack request immediately
    res.status(200).send();

    // Initialize Slack app
    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET
    });

    try {
      // Handle /standup command
      if (req.body.command === '/standup') {
        await app.client.views.open({
          trigger_id: req.body.trigger_id,
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
      }
    } catch (error) {
      console.error('Error handling Slack request:', error);
    }
  } else {
    res.status(405).send({ message: 'Method Not Allowed' });
  }
}