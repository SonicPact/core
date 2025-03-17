-- Drop the existing policy that's causing infinite recursion
DROP POLICY IF EXISTS chat_participants_select_policy ON chat_participants;

-- Create a new policy with a simpler condition that avoids infinite recursion
CREATE POLICY chat_participants_select_policy ON chat_participants
  FOR SELECT USING (
    auth.uid()::uuid IN (
      SELECT user_id FROM chat_participants
      WHERE chat_id = chat_participants.chat_id
    )
  );

-- For extra safety, also simplify the other RLS policies that might cause similar issues
DROP POLICY IF EXISTS chats_select_policy ON chats;
CREATE POLICY chats_select_policy ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = chats.id
      AND chat_participants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS messages_select_policy ON messages;
CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS messages_insert_policy ON messages;
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::uuid
    AND
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS messages_update_policy ON messages;
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = messages.chat_id
      AND chat_participants.user_id = auth.uid()::uuid
    )
  ); 