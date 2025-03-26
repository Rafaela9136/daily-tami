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
            title: {
              type: 'plain_text',
              text: 'Configure Standup Meeting'
            },
            blocks: [
              {
                type: 'section',
                block_id: 'standup_channel',
                text: {
                  type: 'mrkdwn',
                  text: 'Please select the channel for the standup meeting:'
                },
                accessory: {
                  type: 'channels_select',
                  action_id: 'channel_select'
                }
              },
              {
                type: 'section',
                block_id: 'standup_users',
                text: {
                  type: 'mrkdwn',
                  text: 'Select users to participate in the standup meeting:'
                },
                accessory: {
                  type: 'multi_users_select',
                  action_id: 'users_select',
                  placeholder: {
                    type: 'plain_text',
                    text: 'Select users'
                  }
                }
              },
              {
                type: 'section',
                block_id: 'standup_submit',
                text: {
                  type: 'mrkdwn',
                  text: 'Click "Submit" to create the standup meeting.'
                },
                accessory: {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Submit'
                  },
                  action_id: 'submit_standup'
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