"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getChatById, sendMessage } from "../../actions/chat";
import { supabase } from "@/shared/utils/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCurrentUserProfile } from "../../actions/user";

// Define interfaces for the component
interface ChatParticipant {
  id: string;
  user_id: string;
  name: string;
  profile_image_url?: string | null;
}

interface Message {
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

interface ChatData {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  participants: ChatParticipant[];
}

export default function ChatPage() {
  const { id: chatId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat data and subscribe to real-time updates
  useEffect(() => {
    if (!chatId) return;

    const fetchChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const userData = await getCurrentUserProfile();
        setCurrentUser(userData);

        // Get chat data
        const result = await getChatById(chatId as string);
        if (!result.success) {
          setError(result.error || "Failed to load chat");
          return;
        }

        // Type guard to check if result has chat and messages properties
        if ("chat" in result && "messages" in result) {
          setChat(result.chat as ChatData);
          setMessages(result.messages as Message[]);
        }
      } catch (err) {
        setError((err as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          console.log("Real-time message received:", payload);

          try {
            // Get the sender details
            const userData = await getCurrentUserProfile();
            console.log("Current user for message processing:", userData?.id);

            // Add the new message to the state
            const newMessage = payload.new as Message;
            console.log("Processing new message:", newMessage);

            // Check if the message is from the current user
            const isCurrentUser = newMessage.sender_id === userData?.id;
            console.log("Is message from current user:", isCurrentUser);

            // Fetch the sender details
            if (!isCurrentUser && chat) {
              const otherParticipant = chat.participants.find(
                (p) => p.user_id === newMessage.sender_id
              );

              if (otherParticipant) {
                newMessage.sender = {
                  name: otherParticipant.name,
                  profile_image_url: otherParticipant.profile_image_url,
                };
              }
            } else if (userData) {
              newMessage.sender = {
                name: userData.name || "You",
                profile_image_url: userData.profile_image_url || null,
              };
            }

            // Update messages with the new message
            setMessages((prev) => {
              // Check if this message is already in the state (prevent duplicates)
              const exists = prev.some((m) => m.id === newMessage.id);
              if (exists) {
                console.log("Message already exists in state, skipping");
                return prev;
              }
              console.log("Adding new message to state");
              return [...prev, newMessage];
            });
          } catch (err) {
            console.error("Error processing real-time message:", err);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Chat subscription status for chat ${chatId}:`, status);
        if (status === "SUBSCRIBED") {
          console.log(`Successfully subscribed to chat ${chatId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Error subscribing to chat ${chatId}`);
          setError("Failed to establish real-time connection");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || sending) return;

    try {
      setSending(true);
      const result = await sendMessage(chatId as string, newMessage);
      if (!result.success) {
        setError(result.error || "Failed to send message");
        return;
      }
      setNewMessage("");
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setSending(false);
    }
  };

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

  if (!chat) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Chat not found</p>
        </div>
      </div>
    );
  }

  // Find the other participant (for a 1:1 chat)
  const otherParticipant = chat.participants.find(
    (p) => p.user_id !== currentUser?.id
  );

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Chat header */}
      <div className="bg-background border-b border-border p-4 flex items-center">
        {otherParticipant?.profile_image_url ? (
          <img
            src={otherParticipant.profile_image_url}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <span className="text-primary font-medium">
              {otherParticipant?.name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">
            {otherParticipant?.name || "Chat"}
          </h2>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-foreground/50">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-border p-4 bg-background"
      >
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-r-lg p-2 px-4 disabled:opacity-50"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <span className="inline-block w-5 h-5 border-t-2 border-primary-foreground rounded-full animate-spin"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
