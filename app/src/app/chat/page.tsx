"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserChats, getUnreadMessageCount } from "@/app/actions/chat";
import { getCurrentUserProfile } from "@/app/actions/user";
import { supabase } from "@/shared/utils/supabase";

// Define a simpler interface for the component
interface ChatData {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  participants: {
    id: string;
    user_id: string;
    name: string;
    profile_image_url?: string | null;
  }[];
  last_message?: {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_read: boolean | null;
    created_at: string | null;
  } | null;
}

export default function ChatListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch chats and subscribe to real-time updates
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const userData = await getCurrentUserProfile();
        setCurrentUser(userData);

        // Get chats
        const result = await getUserChats();
        if (!result.success) {
          setError(result.error || "Failed to load chats");
          return;
        }

        // Filter out null values
        const validChats = (result.chats || []).filter((chat) => chat !== null);
        setChats(validChats as ChatData[]);
      } catch (err) {
        setError((err as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to new messages for unread count
    const channel = supabase
      .channel("new_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Refresh the chat list to update last messages and unread counts
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>

      {chats.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
          <p className="text-foreground/70 mb-4">
            Start a conversation with a celebrity or studio from the explore
            page.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Explore Users
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => {
            // Find the other participant (for a 1:1 chat)
            const otherParticipant = chat.participants.find(
              (p) => p.user_id !== currentUser?.id
            );

            // Get the last message if available
            const lastMessage = chat.last_message;

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block border border-border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center">
                  {otherParticipant?.profile_image_url ? (
                    <img
                      src={otherParticipant.profile_image_url}
                      alt={otherParticipant.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-primary font-medium">
                        {otherParticipant?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        {otherParticipant?.name || "Unknown User"}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-foreground/50">
                          {new Date(
                            lastMessage.created_at || ""
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70 truncate">
                      {lastMessage ? lastMessage.content : "No messages yet"}
                    </p>
                  </div>

                  {lastMessage &&
                    !lastMessage.is_read &&
                    lastMessage.sender_id !== currentUser?.id && (
                      <div className="ml-2 w-3 h-3 rounded-full bg-primary"></div>
                    )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
