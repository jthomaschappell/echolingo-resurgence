# Crew Link - Construction Communication App

Real-time communication between Spanish-speaking Mexican workers and English-speaking general contractors.

## Features

- **Voice Input**: Workers speak naturally in Mexican Spanish using Web Speech API
- **Real-time Translation**: Instant Spanish-to-English translation via Cerebras
- **Smart Analysis**: Claude AI categorizes messages and detects urgency (safety keywords)
- **WhatsApp Integration**: Messages sent directly to supervisor's WhatsApp
- **Real-time Replies**: Supervisor replies appear instantly in worker's interface via Socket.io
- **Mobile Optimized**: Designed for phones and tablets on construction sites

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Express + Socket.io
- **Database**: Supabase (PostgreSQL via client)
- **AI Services**: Cerebras (translation), Claude (analysis)
- **Messaging**: Twilio WhatsApp API

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Accounts for the following services (all have free tiers):
  - **Supabase** (database)
  - **Cerebras** (translation)
  - **Anthropic Claude** (AI analysis)
  - **Twilio** (WhatsApp messaging)
- **Browser**: Chrome or Edge (for Web Speech API support)

### Installation

**📋 TIP:** Use [SETUP-CHECKLIST.md](SETUP-CHECKLIST.md) to track your progress through these steps!

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then follow the detailed setup instructions below to fill in all API keys.

### Detailed API Setup Instructions

#### 1. Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**
3. Fill in project details:
   - Name: `crew-link` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your location
4. Wait for project to finish setting up (1-2 minutes)
5. In your project dashboard, go to **Settings** → **API**
6. Copy the **Project URL** and paste into `.env` as `NEXT_PUBLIC_SUPABASE_URL`
7. Copy the **service_role** key (under "Project API keys") and paste into `.env` as `SUPABASE_SERVICE_ROLE_KEY`
8. Run the schema: Go to **SQL Editor** → New query → paste contents of `supabase/schema.sql` → Run

**Environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Important:** Keep the service role key secret—it bypasses Row Level Security.

#### 2. Cerebras API Key

1. Go to [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Sign up for a free account (no credit card required for initial credits)
3. After logging in, navigate to **API Keys** in the left sidebar
4. Click **Generate new API key**
5. Copy the API key (starts with `csk-...`)
6. Paste into your `.env` file as `CEREBRAS_API_KEY`

**Example:**
```
CEREBRAS_API_KEY="csk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 3. Anthropic Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for an account
3. Add billing information (required, but you get $5 free credits)
4. Go to **API Keys** at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
5. Click **Create Key**
6. Give it a name (e.g., "Crew Link App")
7. Copy the API key (starts with `sk-ant-...`)
8. Paste into your `.env` file as `ANTHROPIC_API_KEY`

**Example:**
```
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 4. Twilio WhatsApp Setup

**Get Account Credentials:**
1. Go to [twilio.com](https://www.twilio.com) and sign up for a free account
2. Complete phone verification
3. In the Twilio Console dashboard, find your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
4. Copy these to your `.env` file

**Set Up WhatsApp Sandbox (for testing):**
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox number (usually `+1 415 523 8886`) and a join code
3. On your phone, send a WhatsApp message to `+1 415 523 8886` with the text: `join <your-code>`
   - Example: `join happy-elephant`
4. You'll receive a confirmation message
5. Add to your `.env`:
   ```
   TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
   SUPERVISOR_WHATSAPP="whatsapp:+1YOURNUMBER"
   ```
   Replace `YOURNUMBER` with your phone number (the one you joined with)

**Example `.env` entries:**
```
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token-here"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
SUPERVISOR_WHATSAPP="whatsapp:+15551234567"
```

**Important:** The sandbox expires after 3 days of inactivity. To reconnect, send the join message again.

#### 5. Additional Environment Variables

Add these to your `.env`:
```
SOCKET_SERVER_PORT=3001
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Initialize the Database

Once your `.env` is complete:

```bash
npm run db:generate
npm run db:push
```

This creates the necessary database tables in Supabase.

### Start Development Servers

Open **two terminal windows**:

**Terminal 1 - Next.js app:**
```bash
npm run dev
```

**Terminal 2 - Socket.io server:**
```bash
npm run server
```

The app will be available at `http://localhost:3000`

### Configure Twilio Webhook (for supervisor replies)

To receive supervisor replies in real-time:

1. Install ngrok: `brew install ngrok` (Mac) or download from [ngrok.com](https://ngrok.com)
2. Start ngrok: `ngrok http 3001`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. In Twilio Console, go to **Messaging** → **Settings** → **WhatsApp sandbox settings**
5. Under **When a message comes in**, paste: `https://abc123.ngrok.io/webhook/twilio`
6. Save

Now supervisor replies will appear instantly in the worker interface!

### Environment Variables

See `.env.example` for all required variables:
- `CEREBRAS_API_KEY` - Cerebras API key for translation
- `ANTHROPIC_API_KEY` - Claude API key for analysis
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number (format: `whatsapp:+14155238886`)
- `SUPERVISOR_WHATSAPP` - Supervisor's WhatsApp number (format: `whatsapp:+1...`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `SOCKET_SERVER_PORT` - Port for Socket.io server (default: 3001)
- `NEXT_PUBLIC_SOCKET_SERVER_URL` - Socket.io server URL (for client connection)
- `NEXT_PUBLIC_APP_URL` - Next.js app URL (for CORS)

## Manual QA Checklist

### Voice Input & Translation
- [ ] Mic permission prompt appears when clicking microphone button
- [ ] Speech recognition works in Chrome/Edge (Web Speech API - Chrome/Edge only)
- [ ] Browser compatibility message shown if Web Speech API not available
- [ ] Spanish transcript displays immediately after speaking
- [ ] "Cargando..." loading state appears during translation
- [ ] English translation appears after processing completes
- [ ] Error handling works if translation fails

### Urgency Detection
- [ ] Urgency words trigger orange "URGENTE" badge:
  - "emergencia" (emergency)
  - "peligro" (danger)
  - "accidente" (accident)
  - "lesión" (injury)
- [ ] Normal messages do not show urgency badge
- [ ] Urgency badge is visible and properly styled

### WhatsApp Integration
- [ ] Supervisor receives WhatsApp message with formatted English
- [ ] Message includes proper formatting from Claude
- [ ] Message category is correctly identified (delay_report, clarification, completion, safety)
- [ ] High-urgency messages are clearly marked in WhatsApp

### Real-time Replies (Socket.io)
- [ ] Worker UI connects to Socket.io server on page load
- [ ] Supervisor reply via WhatsApp appears in worker UI without page refresh
- [ ] Action summary displays in green highlight box
- [ ] Spanish translation of reply is shown
- [ ] Multiple workers can receive replies simultaneously

### UI/UX
- [ ] Layout is usable on 375px viewport (mobile)
- [ ] Colors match palette:
  - Primary orange (#F77F00) for header and buttons
  - Golden amber (#FCBF49) for logo/branding
  - Cream (#EAE2B7) for content cards
  - Dark grey (#2D2D2D) for background
- [ ] Microphone button is large and easy to tap
- [ ] Conversation list scrolls properly
- [ ] Control panel allows worker ID input
- [ ] Header displays "CREW LINK" logo correctly

### Database
- [ ] Messages are stored in PostgreSQL with all fields
- [ ] Supervisor replies are linked to original messages
- [ ] Timestamps are recorded correctly
- [ ] Database queries work without errors

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] API failures don't crash the app
- [ ] Missing API keys show appropriate errors
- [ ] Database connection errors are handled gracefully

## Project Structure

```
echolingo-resurgence/
├── app/
│   ├── api/messages/route.ts    # POST endpoint for worker messages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Worker interface
│   └── globals.css              # Global styles
├── components/
│   ├── Header.tsx               # App header with logo
│   ├── ControlPanel.tsx         # Worker ID input
│   ├── ConversationList.tsx     # Message list display
│   ├── MessageBubble.tsx        # Individual message component
│   ├── MicrophoneButton.tsx     # Voice input button
│   └── UrgencyBadge.tsx         # Urgency indicator
├── lib/
│   ├── cerebras.ts              # Translation service
│   ├── claude.ts                # Analysis service
│   ├── twilio.ts                # WhatsApp service
│   └── supabase.ts              # Supabase client
├── server/
│   ├── index.ts                 # Express + Socket.io server
│   └── twilioWebhook.ts         # Twilio webhook handler
├── supabase/
│   └── schema.sql               # Database schema (run in Supabase SQL Editor)
└── package.json
```

## Development

- **Next.js dev server**: `npm run dev` (port 3000)
- **Socket.io server**: `npm run server` (port 3001)

## Production Deployment

### Database (Supabase)
Your Supabase database is already set up from the development setup. For production:
1. Same Supabase project URL and service role key work in production
2. Ensure production env has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Consider upgrading from the free tier if you expect high traffic

### Next.js App (Vercel - Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from your `.env` file
4. Add all env vars including `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy

### Socket.io Server (Railway/Render)
The Socket.io server needs a persistent connection, so deploy separately:

**Option 1: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables (all from `.env` except Next.js-specific ones)
4. Set start command: `npm run server`
5. Note the public URL (e.g., `https://your-app.railway.app`)

**Option 2: Render**
1. Go to [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Build command: `npm install`
4. Start command: `npm run server`
5. Add environment variables
6. Deploy

### Final Configuration
1. Update `NEXT_PUBLIC_SOCKET_SERVER_URL` in Vercel to your Socket.io server URL
2. Configure Twilio webhook to `https://your-socket-server.railway.app/webhook/twilio`
3. Update CORS settings if needed for your production domains

## Troubleshooting

### "Speech Recognition not supported"
- Use Chrome or Edge browser (Safari/Firefox don't support Web Speech API)
- Ensure you're on HTTPS in production (required for microphone access)

### Database Connection Issues
- Verify your Supabase password is correct in the connection string
- Check that you've replaced `[YOUR-PASSWORD]` in the connection string
- For serverless deployments, ensure you're using port 6543 with `?pgbouncer=true`
- Run `npm run db:push` to create tables if they don't exist

### Twilio WhatsApp Not Working
- Verify you've joined the sandbox: send `join <your-code>` to +1 415 523 8886
- Sandbox expires after 3 days - rejoin if needed
- Check that `SUPERVISOR_WHATSAPP` matches the number you joined with (include country code)
- Webhook must be HTTPS (use ngrok for local testing)

### Supervisor Replies Not Appearing
- Ensure Socket.io server is running (`npm run server`)
- Check that Twilio webhook is configured correctly
- Verify webhook URL is accessible (ngrok tunnel active)
- Check browser console for Socket.io connection errors

### API Key Errors
- **Cerebras**: Ensure key starts with `csk-`
- **Claude**: Ensure key starts with `sk-ant-` and you have credits/billing set up
- **Twilio**: Verify both Account SID and Auth Token are correct
- Check for extra spaces or quotes in your `.env` file

### Messages Not Translating
- Check Cerebras API credits at cloud.cerebras.ai
- Verify `CEREBRAS_API_KEY` is set correctly
- Check server logs for API error messages

## License

Private project - All rights reserved
