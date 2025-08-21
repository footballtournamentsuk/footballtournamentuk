# Football Tournaments UK - Email Alerts MVP

## Overview

A privacy-safe, email-only alerts system for non-authenticated users to subscribe to tournament notifications based on their search criteria.

## Email Alerts System Features

- **Entry Points**: City pages, tournaments list, filter panel, empty state
- **Double Opt-In**: GDPR-compliant email verification required
- **Filter Binding**: Alerts based on location, format, age groups, type, price, date range
- **Digest System**: Daily (8:00 AM UK) and weekly (Sunday 6:00 PM UK) email digests
- **Management**: Token-based alert management without account requirement
- **Analytics**: Comprehensive event tracking for subscription funnel

## Environment Variables

Set these environment variables in your Supabase project:

```bash
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## CRON Setup

Configure these CRON jobs in your Supabase project to run the digest system:

```sql
-- Daily digest (8:00 AM UK = 8:00 AM UTC for simplicity)
SELECT cron.schedule(
  'daily-tournament-alerts',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"frequency": "daily"}'::jsonb
  ) as request_id;
  $$
);

-- Weekly digest (Sunday 6:00 PM UK = 6:00 PM UTC for simplicity)  
SELECT cron.schedule(
  'weekly-tournament-alerts',
  '0 18 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"frequency": "weekly"}'::jsonb
  ) as request_id;
  $$
);
```

## Testing Digest System

To manually trigger digest emails for testing:

```bash
curl -X POST https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-digest \
  -H "Content-Type: "application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"frequency": "daily"}'
```

## Analytics Events

```typescript
trackEvent('alert_subscription_started', { source: 'list'|'city'|'filters'|'empty' })
trackEvent('alert_subscription_completed', { frequency, channels: ['email'], filters_summary })
trackEvent('alert_unsubscribed', { reason: 'user'|'global' })
```

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/21e19dc3-b9c8-4929-b61a-c85ce0272c04

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/21e19dc3-b9c8-4929-b61a-c85ce0272c04) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.

Once the Codespace is ready, you can start developing immediately.

## What technologies are used for this project?

This project is built with .NET 8 and Blazor.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/21e19dc3-b9c8-4929-b61a-c85ce0272c04) and click on Share -> Publish.

## I want to use a custom domain

We don't support custom domains (yet). If you want to deploy your project under your own domain, you can download the code and deploy it yourself.

## How can I contact the Lovable team?

- Discord: https://discord.gg/7QMraJUsQt
- Email: hello@lovable.dev