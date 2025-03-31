export default function handler(req, res) {
  const isConfigured = process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET;

  return res.status(200).json({
    message: 'Slack Standup Bot is Running!',
    status: 'OK',
    environmentConfigured: isConfigured ? '✅ Configured' : '⚠️ Missing env variables',
  });
}
