-- Run this in Supabase SQL Editor to create the tables
-- (Supabase Dashboard → SQL Editor → New query)

create table if not exists "Message" (
  id uuid primary key default gen_random_uuid(),
  "workerId" text not null,
  "spanishRaw" text not null,
  "englishRaw" text not null,
  "englishFormatted" text not null,
  category text not null,
  urgency text not null,
  "twilioSid" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists "SupervisorReply" (
  id uuid primary key default gen_random_uuid(),
  "messageId" uuid not null references "Message"(id) on delete cascade,
  "englishRaw" text not null,
  "spanishTrans" text not null,
  "actionSummary" text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists "SupervisorReply_messageId_idx" on "SupervisorReply"("messageId");
