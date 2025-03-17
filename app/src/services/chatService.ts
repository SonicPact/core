// Define interfaces for Chat and Message types
export interface ChatParticipant {
  id: string;
  user_id: string;
  name: string;
  profile_image_url?: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string | null;
  sender?: {
    name: string;
    profile_image_url?: string | null;
  };
}

export interface Chat {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  participants: ChatParticipant[];
  last_message?: Message;
}

import { createServerSupabaseClient } from "@/shared/utils/server-auth";

export const chatService = {
  /**
   * Send a chat request to another user
   */
  async sendChatRequest(
    senderId: string,
    recipientId: string,
    message?: string
  ) {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from("chat_requests")
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          status: "pending",
          message,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error sending chat request:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in sendChatRequest:", error);
      return null;
    }
  },

  /**
   * Get all chat requests for a user (both sent and received)
   */
  async getChatRequests(userId: string) {
    try {
      const supabase = await createServerSupabaseClient();

      // Get sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("chat_requests")
        .select("*")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      if (sentError) {
        console.error("Error getting sent chat requests:", sentError);
        return { sent: [], received: [] };
      }

      // Get received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from("chat_requests")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (receivedError) {
        console.error("Error getting received chat requests:", receivedError);
        return { sent: sentData || [], received: [] };
      }

      return {
        sent: sentData || [],
        received: receivedData || [],
      };
    } catch (error) {
      console.error("Error in getChatRequests:", error);
      return { sent: [], received: [] };
    }
  },

  /**
   * Update the status of a chat request
   */
  async updateChatRequestStatus(
    requestId: string,
    status: "accepted" | "rejected"
  ) {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from("chat_requests")
        .update({ status })
        .eq("id", requestId)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating chat request status:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in updateChatRequestStatus:", error);
      return null;
    }
  },

  /**
   * Get all chats for a user with the most recent message
   */
  async getUserChats(userId: string) {
    try {
      console.log("Getting chats for user ID:", userId);
      const supabase = await createServerSupabaseClient();

      // Use a simpler query approach to avoid potential recursion issues
      // First get all chat IDs the user is participating in
      const { data: chatIds, error: chatIdsError } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", userId);

      if (chatIdsError) {
        console.error("Error getting user chat IDs:", chatIdsError);
        return [];
      }

      if (!chatIds || chatIds.length === 0) {
        console.log("No chats found for user", userId);
        return [];
      }

      const chatIdList = chatIds.map((row) => row.chat_id);
      console.log("Found chat IDs:", chatIdList);

      // Get basic chat data
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select("*")
        .in("id", chatIdList);

      if (chatsError || !chatsData) {
        console.error("Error getting chat data:", chatsError);
        return [];
      }

      console.log("Found chat data:", chatsData);

      // For each chat, get the participants and latest message
      const chats = await Promise.all(
        chatsData.map(async (chat) => {
          try {
            console.log("Processing chat ID:", chat.id);

            // Get participants
            const { data: participantsData, error: participantsError } =
              await supabase
                .from("chat_participants")
                .select(
                  `
                  id,
                  user_id,
                  user:users(
                    id,
                    name,
                    profile_image_url
                  )
                `
                )
                .eq("chat_id", chat.id);

            if (participantsError || !participantsData) {
              console.error(
                "Error getting chat participants:",
                participantsError
              );
              return null;
            }

            // Get the most recent message
            const { data: messageData, error: messageError } = await supabase
              .from("messages")
              .select("*")
              .eq("chat_id", chat.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const formattedChat = {
              id: chat.id,
              created_at: chat.created_at,
              updated_at: chat.updated_at,
              participants: participantsData.map((p) => ({
                id: p.id,
                user_id: p.user_id,
                name: p.user?.name || "Unknown User",
                profile_image_url: p.user?.profile_image_url,
              })),
              last_message: messageError ? null : messageData,
            };

            return formattedChat;
          } catch (err) {
            console.error("Error processing chat:", chat.id, err);
            return null;
          }
        })
      );

      console.log("Final processed chats:", chats);

      // Filter out any null values and sort by the most recent message
      const filteredChats = chats.filter(Boolean).sort((a, b) => {
        const aDate = a?.last_message?.created_at || a?.created_at;
        const bDate = b?.last_message?.created_at || b?.created_at;
        return (
          new Date(bDate || "").getTime() - new Date(aDate || "").getTime()
        );
      });

      console.log("Filtered and sorted chats:", filteredChats);
      return filteredChats;
    } catch (error) {
      console.error("Error in getUserChats:", error);
      return [];
    }
  },

  /**
   * Get a single chat by ID with all messages
   */
  async getChatById(chatId: string) {
    try {
      const supabase = await createServerSupabaseClient();

      // Get the chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (chatError || !chatData) {
        console.error("Error getting chat:", chatError);
        return null;
      }

      // Get participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("chat_participants")
          .select(
            `
            id,
            user_id,
            user:user_id(
              name,
              profile_image_url
            )
          `
          )
          .eq("chat_id", chatId);

      if (participantsError || !participantsData) {
        console.error("Error getting chat participants:", participantsError);
        return null;
      }

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:sender_id(
            name,
            profile_image_url
          )
        `
        )
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error getting chat messages:", messagesError);
        return null;
      }

      return {
        chat: {
          id: chatData.id,
          created_at: chatData.created_at,
          updated_at: chatData.updated_at,
          participants: participantsData.map((p) => ({
            id: p.id,
            user_id: p.user_id,
            name: (p.user as any).name,
            profile_image_url: (p.user as any).profile_image_url,
          })),
        },
        messages: (messagesData || []).map((m) => ({
          id: m.id,
          chat_id: m.chat_id,
          sender_id: m.sender_id,
          content: m.content,
          is_read: m.is_read,
          created_at: m.created_at,
          sender: {
            name: (m.sender as any).name,
            profile_image_url: (m.sender as any).profile_image_url,
          },
        })),
      };
    } catch (error) {
      console.error("Error in getChatById:", error);
      return null;
    }
  },

  /**
   * Send a message in a chat
   */
  async sendMessage(chatId: string, senderId: string, content: string) {
    try {
      const supabase = await createServerSupabaseClient();

      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
        })
        .select(
          `
          *,
          sender:sender_id(
            name,
            profile_image_url
          )
        `
        )
        .single();

      if (error) {
        console.error("Error sending message:", error);
        return null;
      }

      // Update the chat's updated_at timestamp
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

      return {
        id: data.id,
        chat_id: data.chat_id,
        sender_id: data.sender_id,
        content: data.content,
        is_read: data.is_read,
        created_at: data.created_at,
        sender: {
          name: (data.sender as any).name,
          profile_image_url: (data.sender as any).profile_image_url,
        },
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return null;
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await createServerSupabaseClient();

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .neq("sender_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking messages as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
      return false;
    }
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const supabase = await createServerSupabaseClient();

      // Get all chats the user is participating in
      const { data: chatsData, error: chatsError } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", userId);

      if (chatsError || !chatsData) {
        console.error("Error getting user chats:", chatsError);
        return 0;
      }

      // Extract chat IDs
      const chatIds = chatsData.map((item) => item.chat_id);

      if (chatIds.length === 0) {
        return 0;
      }

      // Count unread messages in all chats
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("chat_id", chatIds)
        .neq("sender_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Error counting unread messages:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadMessageCount:", error);
      return 0;
    }
  },

  /**
   * Find a chat between two users
   */
  async findChatBetweenUsers(userId1: string, userId2: string) {
    try {
      console.log("Finding chat between users:", userId1, userId2);
      const supabase = await createServerSupabaseClient();

      // Find chats where user1 is a participant
      const { data: user1Participants, error: user1Error } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", userId1);

      if (user1Error || !user1Participants) {
        console.error("Error finding chats for user1:", user1Error);
        return null;
      }

      // Find chats where user2 is a participant
      const { data: user2Participants, error: user2Error } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", userId2);

      if (user2Error || !user2Participants) {
        console.error("Error finding chats for user2:", user2Error);
        return null;
      }

      console.log(
        "User1 chat IDs:",
        user1Participants.map((p) => p.chat_id)
      );
      console.log(
        "User2 chat IDs:",
        user2Participants.map((p) => p.chat_id)
      );

      // Find common chats (chats where both users are participants)
      const user1ChatIds = user1Participants.map((p) => p.chat_id);
      const user2ChatIds = user2Participants.map((p) => p.chat_id);

      const commonChatIds = user1ChatIds.filter((id) =>
        user2ChatIds.includes(id)
      );

      console.log("Common chat IDs:", commonChatIds);

      if (commonChatIds.length === 0) {
        console.log("No common chats found");
        return null;
      }

      // Get the first common chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", commonChatIds[0])
        .single();

      if (chatError || !chatData) {
        console.error("Error getting chat data:", chatError);
        return null;
      }

      console.log("Found chat data:", chatData);

      // Get participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("chat_participants")
          .select(
            `
            id,
            user_id,
            user:user_id(
              name,
              profile_image_url
            )
          `
          )
          .eq("chat_id", chatData.id);

      if (participantsError || !participantsData) {
        console.error("Error getting participants data:", participantsError);
        return null;
      }

      console.log("Found participants data:", participantsData);

      return {
        id: chatData.id,
        created_at: chatData.created_at,
        updated_at: chatData.updated_at,
        participants: participantsData.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          name: (p.user as any).name,
          profile_image_url: (p.user as any).profile_image_url,
        })),
      };
    } catch (error) {
      console.error("Error in findChatBetweenUsers:", error);
      return null;
    }
  },

  /**
   * Find a pending chat request between two users
   */
  async findPendingChatRequest(
    userId1: string,
    userId2: string
  ): Promise<any | null> {
    try {
      const supabase = await createServerSupabaseClient();

      // Check for a pending request from user1 to user2
      const { data: request1, error: error1 } = await supabase
        .from("chat_requests")
        .select("*")
        .eq("sender_id", userId1)
        .eq("recipient_id", userId2)
        .eq("status", "pending")
        .maybeSingle();

      if (error1) {
        console.error("Error checking chat request 1:", error1);
        return null;
      }

      if (request1) {
        return request1;
      }

      // Check for a pending request from user2 to user1
      const { data: request2, error: error2 } = await supabase
        .from("chat_requests")
        .select("*")
        .eq("sender_id", userId2)
        .eq("recipient_id", userId1)
        .eq("status", "pending")
        .maybeSingle();

      if (error2) {
        console.error("Error checking chat request 2:", error2);
        return null;
      }

      return request2;
    } catch (error) {
      console.error("Error in findPendingChatRequest:", error);
      return null;
    }
  },
};
