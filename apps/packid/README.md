This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Email

Password reset emails are sent from an OVHcloud/Zimbra mailbox over SMTP when these environment variables are set:

```bash
SMTP_HOST="ssl0.ovh.net"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-address@your-domain.com"
SMTP_PASSWORD="your-ovh-mailbox-password"
EMAIL_FROM="Packid <your-address@your-domain.com>"
APP_BASE_URL="http://localhost:3000"
```

If `SMTP_USER` or `SMTP_PASSWORD` is missing, Packid simulates the email and prints the reset link in the server logs.

## WhatsApp

Candidate invitations use the official WhatsApp Cloud API when these variables are set:

```bash
WHATSAPP_ACCESS_TOKEN="EA..."
WHATSAPP_PHONE_NUMBER_ID="123456789"
WHATSAPP_API_VERSION="v23.0"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="choose-a-long-random-token"
```

Optional template mode:

```bash
WHATSAPP_TEMPLATE_NAME="packid_interview_invitation"
WHATSAPP_TEMPLATE_LANGUAGE="fr"
```

If `WHATSAPP_TEMPLATE_NAME` is missing, Packid sends a text message. In production, Meta may require an approved WhatsApp template to start a new conversation with a candidate.

Webhook callback URL:

```text
https://your-domain.com/api/whatsapp/webhook
```

Use the same value for Meta's verify token and `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
