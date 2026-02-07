# Setup Checklist

Use this checklist to track your progress setting up the Crew Link app.

## ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Chrome or Edge browser (for Web Speech API)

## ✅ Service Accounts Created
- [ ] Supabase account created
- [ ] Cerebras account created
- [ ] Anthropic Claude account created
- [ ] Twilio account created

## ✅ API Keys Obtained
- [ ] Supabase project created and connection string copied
- [ ] Cerebras API key generated
- [ ] Claude API key generated (billing info added)
- [ ] Twilio Account SID and Auth Token copied
- [ ] Twilio WhatsApp sandbox joined

## ✅ Environment Setup
- [ ] Cloned repository
- [ ] Ran `npm install`
- [ ] Created `.env` file from `.env.example`
- [ ] Added `DATABASE_URL` to `.env`
- [ ] Added `CEREBRAS_API_KEY` to `.env`
- [ ] Added `ANTHROPIC_API_KEY` to `.env`
- [ ] Added `TWILIO_ACCOUNT_SID` to `.env`
- [ ] Added `TWILIO_AUTH_TOKEN` to `.env`
- [ ] Added `TWILIO_WHATSAPP_FROM` to `.env`
- [ ] Added `SUPERVISOR_WHATSAPP` to `.env`

## ✅ Database Setup
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push`
- [ ] Verified tables created in Supabase dashboard

## ✅ Local Development
- [ ] Started Next.js server (`npm run dev`)
- [ ] Started Socket.io server (`npm run server`)
- [ ] Opened app at http://localhost:3000
- [ ] Tested microphone permission
- [ ] Spoke a test message in Spanish
- [ ] Verified message appeared in UI
- [ ] Checked WhatsApp for supervisor message

## ✅ Webhook Setup (for supervisor replies)
- [ ] Installed ngrok
- [ ] Started ngrok tunnel (`ngrok http 3001`)
- [ ] Copied ngrok HTTPS URL
- [ ] Configured Twilio webhook URL
- [ ] Tested supervisor reply via WhatsApp
- [ ] Verified reply appeared in worker UI

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

Use this space to track your specific configuration:

- **Supabase Project ID**: ____________________
- **Ngrok URL**: ____________________
- **Vercel URL**: ____________________
- **Railway URL**: ____________________
