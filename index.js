require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const channelId = process.env.SLACK_CHANNEL_ID; // Slack channel for standup reports

async function sendStandupMessage() {
  try {
    await app.client.chat.postMessage({
      channel: channelId,
      text: "⏰ *Daily Standup Time!* ⏰\n\n1️⃣ What did you do yesterday?\n2️⃣ What will you do today?\n3️⃣ Any blockers?",
    });
  } catch (error) {
    console.error("Error sending standup message:", error);
  }
}

// Listen for user responses in the channel
app.message(async ({ message, say }) => {
  if (!message.subtype) {
    await app.client.chat.postMessage({
      channel: channelId,
      text: `📢 <@${message.user}> responded:\n> ${message.text}`
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ Slack bot is running!');
})();
