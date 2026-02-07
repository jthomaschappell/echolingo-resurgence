```
Worker (Web) → Voice → Cerebras → Claude → PostgreSQL
                         ↓
              [All messages] → WhatsApp to Supervisor
                         ↓
    Supervisor replies → Twilio webhook → PostgreSQL → Socket.io → Worker
```

