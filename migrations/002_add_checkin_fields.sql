-- Add checkin columns to the users table
-- TODO: example
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS checkin_confirmed  BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS checkin_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkin_number     INTEGER;

-- TODO: example
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code VARCHAR(5) UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  event_id TEXT,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON tickets (ticket_code);

-- seed data for local dev
INSERT INTO tickets (ticket_code, user_name, user_phone)
VALUES ('abc12', 'João Lucas dos Santos', '5511912341234')
ON CONFLICT (ticket_code) DO NOTHING;