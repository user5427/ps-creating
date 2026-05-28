# Twilio + SendGrid Setup

This project uses Twilio for SMS and Twilio SendGrid for email delivery.

## SMS (Twilio)

Required environment variables:

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

Notes:
- The phone number must be SMS-enabled in Twilio.
- Attendee phone numbers must be in E.164 format (example: +15555550123).

## Email (Twilio SendGrid)

Required environment variables:

https://app.sendgrid.com/settings/sender_auth/senders?utm_source=chatgpt.com

- SENDGRID_API_KEY
- MAIL_FROM

Notes:
- The SendGrid API key must include Mail Send permissions.
- The MAIL_FROM address must be verified in SendGrid (single sender or domain authentication).

## Where SMS/Email Are Sent

- Ticket purchase confirmation: email + SMS (if phone number exists).
- Event reminder (~24 hours before start): email + SMS (if phone number exists).
