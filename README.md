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
- **Database**: PostgreSQL + Prisma
- **AI Services**: Cerebras (translation), Claude (analysis)
- **Messaging**: Twilio WhatsApp API

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys for:
  - Cerebras API
  - Anthropic Claude API
  - Twilio (WhatsApp enabled)
- **Browser**: Chrome or Edge (for Web Speech API support)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in all required API keys and database URL.

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development servers:**

   Terminal 1 (Next.js app):
   ```bash
   npm run dev
   ```

   Terminal 2 (Socket.io server):
   ```bash
   npm run server
   ```

5. **Configure Twilio Webhook:**
   - In Twilio Console, set webhook URL to: `https://your-domain.com/webhook/twilio`
   - For local development, use ngrok: `ngrok http 3001`
   - Update webhook URL in Twilio with ngrok URL

### Environment Variables

See `.env.example` for all required variables:
- `CEREBRAS_API_KEY` - Cerebras API key for translation
- `ANTHROPIC_API_KEY` - Claude API key for analysis
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number (format: `whatsapp:+14155238886`)
- `SUPERVISOR_WHATSAPP` - Supervisor's WhatsApp number (format: `whatsapp:+1...`)
- `DATABASE_URL` - PostgreSQL connection string
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
│   └── prisma.ts                # Database client
├── server/
│   ├── index.ts                 # Express + Socket.io server
│   └── twilioWebhook.ts        # Twilio webhook handler
├── prisma/
│   └── schema.prisma            # Database schema
└── package.json
```

## Development

- **Next.js dev server**: `npm run dev` (port 3000)
- **Socket.io server**: `npm run server` (port 3001)
- **Database studio**: `npm run db:studio`
- **Generate Prisma client**: `npm run db:generate`
- **Push schema changes**: `npm run db:push`

## Production Deployment

1. Set up PostgreSQL database (e.g., Vercel Postgres, Supabase, Railway)
2. Deploy Next.js app (e.g., Vercel)
3. Deploy Socket.io server (e.g., Railway, Render, or same server as Next.js)
4. Update environment variables in production
5. Configure Twilio webhook URL to production Socket.io server
6. Ensure CORS settings allow production domains

## License

Private project - All rights reserved
