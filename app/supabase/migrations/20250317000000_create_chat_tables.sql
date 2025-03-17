-- Create chat_requests table to track pending chat requests between users
CREATE TABLE IF NOT EXISTS chat_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate requests between the same users
  CONSTRAINT unique_chat_request UNIQUE (sender_id, recipient_id)
);

-- Create index on sender_id and recipient_id for faster lookups
CREATE INDEX IF NOT EXISTS chat_requests_sender_id_idx ON chat_requests(sender_id);
CREATE INDEX IF NOT EXISTS chat_requests_recipient_id_idx ON chat_requests(recipient_id);
CREATE INDEX IF NOT EXISTS chat_requests_status_idx ON chat_requests(status);

-- Create chats table to store active chat conversations
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_participants table to track users in each chat
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate participants in the same chat
  CONSTRAINT unique_chat_participant UNIQUE (chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_participants_chat_id_idx ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS chat_participants_user_id_idx ON chat_participants(user_id);

-- Create messages table to store chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Create trigger to update the updated_at column for chat_requests
CREATE TRIGGER update_chat_requests_updated_at
BEFORE UPDATE ON chat_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update the updated_at column for chats
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policy for chat_requests: Users can only see requests they've sent or received
CREATE POLICY chat_requests_select_policy ON chat_requests
  FOR SELECT USING (
    auth.uid()::uuid IN (
      SELECT id FROM users WHERE id = sender_id OR id = recipient_id
    )
  );

-- RLS policy for chat_requests: Users can only insert requests they're sending
CREATE POLICY chat_requests_insert_policy ON chat_requests
  FOR INSERT WITH CHECK (
    auth.uid()::uuid IN (
      SELECT id FROM users WHERE id = sender_id
    )
  );

-- RLS policy for chat_requests: Users can only update requests they've received
CREATE POLICY chat_requests_update_policy ON chat_requests
  FOR UPDATE USING (
    auth.uid()::uuid IN (
      SELECT id FROM users WHERE id = recipient_id
    )
  );

-- RLS policy for chats: Users can only see chats they're participating in
CREATE POLICY chats_select_policy ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      JOIN users ON users.id = chat_participants.user_id
      WHERE chat_participants.chat_id = chats.id
      AND users.id = auth.uid()::uuid
    )
  );

-- RLS policy for chat_participants: Users can only see participants of chats they're in
CREATE POLICY chat_participants_select_policy ON chat_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      JOIN users ON users.id = cp.user_id
      WHERE cp.chat_id = chat_participants.chat_id
      AND users.id = auth.uid()::uuid
    )
  );

-- RLS policy for messages: Users can only see messages from chats they're in
CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      JOIN users ON users.id = chat_participants.user_id
      WHERE chat_participants.chat_id = messages.chat_id
      AND users.id = auth.uid()::uuid
    )
  );

-- RLS policy for messages: Users can only insert messages to chats they're in
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::uuid IN (
      SELECT id FROM users WHERE id = sender_id
    ) AND
    EXISTS (
      SELECT 1 FROM chat_participants
      JOIN users ON users.id = chat_participants.user_id
      WHERE chat_participants.chat_id = messages.chat_id
      AND users.id = auth.uid()::uuid
    )
  );

-- RLS policy for messages: Users can only update messages they've sent (for marking as read)
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      JOIN users ON users.id = chat_participants.user_id
      WHERE chat_participants.chat_id = messages.chat_id
      AND users.id = auth.uid()::uuid
    )
  );

-- Function to create a chat from an accepted request
CREATE OR REPLACE FUNCTION create_chat_from_request(request_id UUID)
RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
  v_sender_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Get the sender and recipient from the request
  SELECT sender_id, recipient_id INTO v_sender_id, v_recipient_id
  FROM chat_requests
  WHERE id = request_id AND status = 'accepted';
  
  -- If request not found or not accepted, return null
  IF v_sender_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Create a new chat
  INSERT INTO chats DEFAULT VALUES
  RETURNING id INTO v_chat_id;
  
  -- Add both users as participants
  INSERT INTO chat_participants (chat_id, user_id)
  VALUES (v_chat_id, v_sender_id), (v_chat_id, v_recipient_id);
  
  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a chat when a request is accepted
CREATE OR REPLACE FUNCTION handle_chat_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If the status was changed to 'accepted', create a chat
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
    PERFORM create_chat_from_request(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_request_status_change_trigger
AFTER INSERT OR UPDATE OF status ON chat_requests
FOR EACH ROW
EXECUTE FUNCTION handle_chat_request_status_change(); 