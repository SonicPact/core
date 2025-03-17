-- Create the deals table to store deal information between studios and celebrities
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES users(id),
  celebrity_id UUID NOT NULL REFERENCES users(id),
  onchain_id INTEGER,
  platform_authority TEXT,
  
  -- Deal information
  name TEXT NOT NULL,
  description TEXT,
  
  -- Deal status
  status TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'funded', 'completed', 'cancelled')),
  
  -- Deal terms
  payment_amount NUMERIC NOT NULL,
  royalty_percentage NUMERIC,
  duration_days INTEGER,
  usage_rights TEXT,
  exclusivity BOOLEAN DEFAULT FALSE,
  additional_terms TEXT,
  
  -- Funding information
  funded_amount NUMERIC,
  
  -- NFT-related columns
  nft_mint_address TEXT,
  nft_metadata_uri TEXT,
  nft_image_url TEXT,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS deals_studio_id_idx ON deals(studio_id);
CREATE INDEX IF NOT EXISTS deals_celebrity_id_idx ON deals(celebrity_id);
CREATE INDEX IF NOT EXISTS deals_status_idx ON deals(status);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- RLS policy for deals: Users can only see deals they're part of
CREATE POLICY deals_select_policy ON deals
  FOR SELECT USING (
    auth.uid()::uuid IN (studio_id, celebrity_id)
  );

-- RLS policy for deals: Studios can create deals
CREATE POLICY deals_insert_policy ON deals
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = studio_id AND
    status = 'proposed'
  );

-- RLS policy for deals: Both parties can update deals they're part of
CREATE POLICY deals_update_policy ON deals
  FOR UPDATE USING (
    auth.uid()::uuid IN (studio_id, celebrity_id)
  );

-- Add a row level security policy for service role to bypass all restrictions
CREATE POLICY deals_service_role_policy ON deals
  FOR ALL USING (auth.jwt() ? 'service_role');

-- Create a new table to track NFT certificates
CREATE TABLE IF NOT EXISTS nft_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  mint_address text NOT NULL,
  metadata_uri text NOT NULL,
  image_url text,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE nft_certificates ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting nft_certificates
CREATE POLICY "Anyone can view NFT certificates"
  ON nft_certificates FOR SELECT
  USING (true);

-- Create policy for inserting nft_certificates
CREATE POLICY "Only platform admin can insert NFT certificates"
  ON nft_certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE deals.id = nft_certificates.deal_id
      AND (
        deals.studio_id = auth.uid() OR 
        deals.celebrity_id = auth.uid()
      )
    )
  );

-- Check if the supabase_realtime publication exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Publication exists, just add the table
    ALTER publication supabase_realtime ADD TABLE nft_certificates;
  ELSE
    -- Publication doesn't exist, create it
    CREATE publication supabase_realtime FOR TABLE nft_certificates;
  END IF;
END
$$;

-- Create a function to update the deals table when an NFT is minted
CREATE OR REPLACE FUNCTION public.update_deal_with_nft_data()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals
  SET 
    nft_mint_address = NEW.mint_address,
    nft_metadata_uri = NEW.metadata_uri,
    nft_image_url = NEW.image_url,
    updated_at = now()
  WHERE id = NEW.deal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the deals table when an NFT certificate is created
CREATE TRIGGER update_deal_with_nft_data
  AFTER INSERT ON nft_certificates
  FOR EACH ROW
  EXECUTE PROCEDURE update_deal_with_nft_data(); 