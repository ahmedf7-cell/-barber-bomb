Barber Bomb — WhatsApp production setup

1. Create/configure a WhatsApp Business Platform app.
2. Put the real access token, phone-number ID and webhook verify token in server/.env.
3. Replace vXX.X in server/server.js with the current Graph API version used by your Meta app.
4. Deploy the project on HTTPS.
5. Configure the WhatsApp webhook URL:
   https://YOUR-DOMAIN/api/whatsapp/webhook
6. Subscribe the webhook to the messages event.
7. Use /api/whatsapp/send from the admin/backend to send approved messages.
8. For automated appointment reminders/marketing, use approved WhatsApp message templates where required by WhatsApp policy.

This package intentionally contains no real credentials.
