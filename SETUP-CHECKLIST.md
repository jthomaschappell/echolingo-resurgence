# Setup Checklist

Use this checklist to track your progress setting up the Crew Link app.

## ✅ Prerequisites
- [x] Node.js 18+ installed
- [x] npm installed
- [x] Chrome or Edge browser (for Web Speech API)

## ✅ Service Accounts Created
- [x] Supabase account created
- [x] Cerebras account created
- [x] Anthropic Claude account created
- [ ] Twilio account created

## ✅ API Keys Obtained
- [x] Supabase project created and connection string copied
- [x] Cerebras API key generated
- [x] Claude API key generated (billing info added)
- [x] Twilio Account SID and Auth Token copied
- [x] Twilio WhatsApp sandbox joined

## ✅ Environment Setup
- [x] Cloned repository
- [x] Ran `npm install`
- [x] Created `.env` file from `.env.example`
- [x] Added `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- [x] Added `CEREBRAS_API_KEY` to `.env`
- [x] Added `ANTHROPIC_API_KEY` to `.env`
- [x] Added `TWILIO_ACCOUNT_SID` to `.env`
- [x] Added `TWILIO_AUTH_TOKEN` to `.env`
- [x] Added `TWILIO_WHATSAPP_FROM` to `.env`
- [x] Added `SUPERVISOR_WHATSAPP` to `.env`

## ✅ Database Setup
- [x] Ran `supabase/schema.sql` in Supabase SQL Editor
- [x] Verified `Message` and `SupervisorReply` tables exist in Supabase dashboard

## ✅ Local Development
- [x] Started Next.js server (`npm run dev`)
- [x] Started Socket.io server (`npm run server`)
- [x] Opened app at http://localhost:3000
- [x] Tested microphone permission
- [x] Spoke a test message in Spanish
- [x] Verified message appeared in UI
- [x] Checked WhatsApp for supervisor message

## ✅ Webhook Setup (for supervisor replies)

Twilio needs to reach your local Socket.io server to deliver supervisor replies. Since your computer isn't publicly reachable, **ngrok** creates a secure tunnel that forwards incoming HTTPS requests to `localhost:3001`.

### Step 1: Install ngrok

**macOS (Homebrew):**
```bash
brew install ngrok
```

**macOS / Windows / Linux (direct download):**
1. Go to [ngrok.com/download](https://ngrok.com/download)
2. Download for your OS
3. Unzip and move `ngrok` to a folder in your PATH (e.g. `/usr/local/bin` on Mac)

**Verify installation:**
```bash
ngrok version
```

- [ ] ngrok installed and `ngrok version` works

### Step 2: (Optional) Create a free ngrok account

Free accounts give you a persistent URL across restarts (otherwise ngrok generates a new random URL each time).

1. Sign up at [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Copy your authtoken from the dashboard
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

- [ ] (Optional) ngrok authtoken configured

### Step 3: Start the Socket.io server

In a terminal, ensure the Socket.io server is running **before** starting ngrok:

```bash
npm run server
```

You should see: `Server running on port 3001 (Twilio webhook at /webhook/twilio)`

- [ ] Socket.io server is running on port 3001

### Step 4: Start the ngrok tunnel

In a **separate terminal**, run:

```bash
ngrok http 3001
```

You’ll see output like:

```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3001
```

- [ ] ngrok tunnel is running
- [ ] Copied the `https://` forwarding URL (e.g. `https://abc123.ngrok-free.app`)

**Note:** Keep this terminal open. Closing it stops the tunnel and Twilio won’t be able to reach your server.

### Step 5: Configure Twilio webhook

1. Log in to [Twilio Console](https://console.twilio.com)
2. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Open **WhatsApp sandbox** settings (or **Messaging** → **Settings** → **WhatsApp sandbox settings**)
4. Find **When a message comes in**
5. Paste your webhook URL: `https://YOUR-NGROK-URL/webhook/twilio`  
   Example: `https://abc123.ngrok-free.app/webhook/twilio`
6. Set the method to **HTTP POST**
7. Click **Save**

- [ ] Twilio webhook URL set to `https://YOUR-NGROK-URL/webhook/twilio`
- [ ] Method set to POST

### Step 6: Test the flow

1. Open the app at http://localhost:3000
2. Send a test message (e.g. speak in Spanish and send)
3. Reply to that message on WhatsApp (as the supervisor)
4. Confirm the reply appears in the worker UI in real time

- [ ] Sent test message from worker UI
- [ ] Replied via WhatsApp
- [ ] Reply appeared in worker UI without refresh

### Troubleshooting

| Issue | Fix |
|------|-----|
| Twilio webhook returns 502/504 | Ensure `npm run server` is running and ngrok tunnel is active |
| ngrok URL changed | Update the Twilio webhook URL; free ngrok URLs change each restart unless you have an account |
| No reply in UI | Check both terminal logs (server + ngrok) for incoming POST requests and errors |
| "ngrok not found" | Ensure ngrok is in your PATH or use the full path to the binary |

## ✅ Production Deployment (Optional)
- [ ] Deployed Next.js app to Vercel
- [ ] Deployed Socket.io server to Railway/Render
- [ ] Updated environment variables in production
- [ ] Switched to Supabase pooled connection
- [ ] Updated Twilio webhook to production URL
- [ ] Tested end-to-end in production

---

## 🆘 Need Help?

See the **Troubleshooting** section in README.md for common issues and solutions.

## 📝 Notes

