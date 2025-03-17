-- Temporarily disable RLS to clear out all existing policies
ALTER TABLE chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS chat_participants_select_policy ON chat_participants;
DROP POLICY IF EXISTS chat_participants_service_role_policy ON chat_participants;
DROP POLICY IF EXISTS chats_select_policy ON chats;
DROP POLICY IF EXISTS chats_service_role_policy ON chats;
DROP POLICY IF EXISTS messages_select_policy ON messages;
DROP POLICY IF EXISTS messages_insert_policy ON messages;
DROP POLICY IF EXISTS messages_update_policy ON messages;
DROP POLICY IF EXISTS messages_service_role_policy ON messages;

-- Re-enable RLS
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simple policies for chat_participants
-- 1. User can access their own participants records
CREATE POLICY chat_participants_self_policy ON chat_participants
  FOR ALL USING (user_id = auth.uid()::uuid);
  
-- 2. User can access participants of chats they're in
CREATE POLICY chat_participants_member_policy ON chat_participants
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Create simple policies for chats
-- 1. User can access chats they're a participant in
CREATE POLICY chats_member_policy ON chats
  FOR ALL USING (
    id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Create simple policies for messages
-- 1. User can access messages in chats they're a participant in
CREATE POLICY messages_member_select_policy ON messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- 2. User can insert messages if they're the sender and in the chat
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::uuid
    AND
    chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- 3. User can update messages in chats they're in
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Add bypass policies for the service role
CREATE POLICY chat_participants_admin_policy ON chat_participants
  FOR ALL USING (auth.jwt() ? 'service_role');
  
CREATE POLICY chats_admin_policy ON chats
  FOR ALL USING (auth.jwt() ? 'service_role');
  
CREATE POLICY messages_admin_policy ON messages
  FOR ALL USING (auth.jwt() ? 'service_role'); 