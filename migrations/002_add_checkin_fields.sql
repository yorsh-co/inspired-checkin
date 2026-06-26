-- install required dependencies
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- create users table with required columns
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT,

  ticket_code VARCHAR(5) UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  
  checkin_complete BOOLEAN NOT NULL DEFAULT FALSE,
  checkin_at TIMESTAMPTZ,
  checkin_number INTEGER UNIQUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- seed data for local dev
INSERT INTO users (ticket_code, user_name, user_phone)
VALUES ('abc12', 'João Lucas dos Santos', '5511912341234')
ON CONFLICT (ticket_code) DO NOTHING;