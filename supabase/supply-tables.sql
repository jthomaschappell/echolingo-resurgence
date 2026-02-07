-- Supply Intelligence Agent tables
-- Run this in Supabase SQL Editor after schema.sql

-- Valid statuses: PENDING, APPROVED, MODIFIED, REJECTED, QUESTIONED

create table if not exists "SupplyOrder" (
  id uuid primary key default gen_random_uuid(),
  "crewId" text not null,
  item text not null,
  "normalizedItem" text not null,
  quantity integer not null,
  unit text not null,
  supplier text,
  cost numeric(10,2),
  "orderedAt" timestamptz not null default now(),
  "deliveredAt" timestamptz,
  notes text
);

create index if not exists "SupplyOrder_crew_item_idx"
  on "SupplyOrder"("crewId", "normalizedItem");

create table if not exists "SupplyRequest" (
  id uuid primary key default gen_random_uuid(),
  "originalMessageId" uuid references "Message"(id) on delete set null,
  "crewId" text not null,
  "workerId" text not null,
  item text not null,
  "normalizedItem" text not null,
  quantity integer,
  unit text,
  urgency text not null default 'normal',
  status text not null default 'PENDING',
  "suggestedQuantity" integer,
  "suggestedSupplier" text,
  "estimatedTotal" numeric(10,2),
  "responseTimeMinutes" integer,
  "approvedBy" text,
  "approvedAt" timestamptz,
  "modifiedQuantity" integer,
  "rejectionReason" text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "SupplyRequest_status_created_idx"
  on "SupplyRequest"(status, "createdAt");
