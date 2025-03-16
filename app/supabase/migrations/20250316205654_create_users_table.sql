-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('studio', 'celebrity')),
  name TEXT NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  website TEXT,
  
  -- Social links
  twitter_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  
  -- For celebrities only
  category TEXT CHECK (
    user_type != 'celebrity' OR 
    category IN ('athlete', 'actor', 'musician', 'influencer', 'streamer', 'other')
  ),
  verified BOOLEAN DEFAULT FALSE,
  verification_document_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON users(wallet_address);

-- Create index on user_type for filtering
CREATE INDEX IF NOT EXISTS users_user_type_idx ON users(user_type);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all profiles
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (true);

-- Policy to allow users to update only their own profile
CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (wallet_address = auth.jwt() ->> 'sub');

-- Policy to allow users to insert only their own profile
CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (wallet_address = auth.jwt() ->> 'sub');
