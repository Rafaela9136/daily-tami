const { App } = require('@slack/bolt');

// Initialize Slack app with your app's token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Command to open the modal when "/standup" is used in Slack
app.command('/standup', async ({ command, ack, client }) => {
  await ack(); // Acknowledge the slash command request to Slack

  // Open the modal
  await client.views.open({
    trigger_id: command.trigger_id,  // Trigger the modal using the `trigger_id` from the slash command
    view: {
      type: 'modal',
      callback_id: 'standup_modal',
      title: {
        type: 'plain_text',
        text: 'Configure Standup Meeting'  // Title of the modal
      },
      blocks: [
        {
          type: 'section',
          block_id: 'standup_channel',  // Block for selecting the Slack channel
          text: {
            type: 'mrkdwn',
            text: 'Please select the channel for the standup meeting:'
          },
          accessory: {
            type: 'channels_select',  // Slack's native UI component to select a channel
            action_id: 'channel_select'
          }
        },
        {
          type: 'section',
          block_id: 'standup_users',  // Block for selecting users
          text: {
            type: 'mrkdwn',
            text: 'Select users to participate in the standup meeting:'
          },
          accessory: {
            type: 'multi_users_select',  // Allows multiple users to be selected
            action_id: 'users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users'
            }
          }
        },
        {
          type: 'section',
          block_id: 'standup_submit',  // Submit button block
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
});

// Start the app
(async () => {
  await app.start();
  console.log('Slack app is running!');
})();
