# Tailored Solutions Portal

ALBS Expert Portal - Dialectica-style client onboarding.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Material UI (MUI)
- **Database:** PostgreSQL via Prisma
- **Data Enrichment:** Apollo.io
- **Email:** Resend

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for required variables.

### Apollo.io Setup
1. Sign up at https://apollo.io
2. Get your API key from Settings > API
3. Add to `.env` as `APOLLO_API_KEY`

## Features

- **Admin Dashboard:** Add clients via LinkedIn URL, trigger enrichment
- **Auto-Enrichment:** Apollo.io pulls name, headline, company, email, phone
- **Token-Based Portal:** Unique link per client, no login required
- **Multi-Step Onboarding:** Getting Started → Availabilities → Profile Boost
- **Auto-Save:** Progress saved as client moves through steps
