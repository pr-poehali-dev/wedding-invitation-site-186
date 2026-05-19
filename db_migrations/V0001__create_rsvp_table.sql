CREATE TABLE IF NOT EXISTS t_p24914580_wedding_invitation_s.rsvp (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  diet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);