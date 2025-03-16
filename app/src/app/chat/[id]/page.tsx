"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/shared/components/Icon";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatParticipant {
  id: string;
  name: string;
  profileImage: string;
  type: "studio" | "celebrity";
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<ChatParticipant | null>(null);
  const [recipient, setRecipient] = useState<ChatParticipant | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat data
  useEffect(() => {
    const fetchChatData = async () => {
      setIsLoading(true);

      // Mock data for now
      // In a real implementation, this would fetch from the blockchain

      // Mock current user (would come from wallet/blockchain)
      const mockCurrentUser: ChatParticipant = {
        id: "studio1",
        name: "GameStudio XYZ",
        profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
        type: "studio",
      };

      // Mock recipient based on chat ID
      const mockRecipient: ChatParticipant = {
        id: "2",
        name: "Jane Smith",
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        type: "celebrity",
      };

      // Mock messages
      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: "studio1",
          text: "Hi Jane, we're interested in collaborating with you for our upcoming game.",
          timestamp: "2023-05-15T10:30:00Z",
          isRead: true,
        },
        {
          id: "2",
          senderId: "2",
          text: "Hello! I'd be interested to hear more about your project.",
          timestamp: "2023-05-15T10:35:00Z",
          isRead: true,
        },
        {
          id: "3",
          senderId: "studio1",
          text: "Great! We're developing an RPG game and would like to feature your likeness as an in-game character NFT.",
          timestamp: "2023-05-15T10:40:00Z",
          isRead: true,
        },
        {
          id: "4",
          senderId: "2",
          text: "That sounds interesting. What kind of terms are you thinking?",
          timestamp: "2023-05-15T10:45:00Z",
          isRead: true,
        },
        {
          id: "5",
          senderId: "studio1",
          text: "We're thinking of a flat fee plus royalties on sales of your character NFT. Would you be open to that?",
          timestamp: "2023-05-15T10:50:00Z",
          isRead: true,
        },
        {
          id: "6",
          senderId: "2",
          text: "Yes, that sounds reasonable. What percentage of royalties are you offering?",
          timestamp: "2023-05-15T11:00:00Z",
          isRead: false,
        },
      ];

      setCurrentUser(mockCurrentUser);
      setRecipient(mockRecipient);
      setMessages(mockMessages);
      setIsLoading(false);
    };

    fetchChatData();
  }, [chatId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser) return;

    // Create new message
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Add to messages
    setMessages([...messages, newMsg]);
    setNewMessage("");

    // In a real implementation, this would send the message to the blockchain
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = formatDate(message.timestamp);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-5xl mx-auto">
        <div className="bg-background border border-secondary/20 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-120px)] flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-secondary/20 flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Icon name="arrow-left" className="text-foreground/70" />
            </Link>

            {isLoading ? (
              <div className="animate-pulse h-10 w-40 bg-secondary/10 rounded-lg"></div>
            ) : recipient ? (
              <div className="flex items-center">
                <img
                  src={recipient.profileImage}
                  alt={recipient.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h2 className="font-bold">{recipient.name}</h2>
                  <p className="text-xs text-foreground/50 capitalize">
                    {recipient.type}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="ml-auto flex gap-2">
              {!isLoading && currentUser?.type === "studio" && (
                <Link
                  href={`/deals/create?celebrity=${recipient?.id}`}
                  className="flex items-center text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Icon name="file-text" className="mr-1" />
                  Create Deal
                </Link>
              )}
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="animate-pulse h-8 w-8 bg-secondary/10 rounded-full"></div>
                    <div className="animate-pulse h-16 w-3/4 bg-secondary/10 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-center">
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                      {date}
                    </span>
                  </div>

                  {dateMessages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start max-w-[75%] ${
                            isCurrentUser ? "flex-row-reverse" : ""
                          }`}
                        >
                          {!isCurrentUser && (
                            <img
                              src={recipient?.profileImage}
                              alt={recipient?.name}
                              className="w-8 h-8 rounded-full object-cover mx-2 mt-1"
                            />
                          )}

                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary/10 text-foreground"
                            }`}
                          >
                            <p>{message.text}</p>
                            <div
                              className={`text-xs mt-1 ${
                                isCurrentUser
                                  ? "text-primary-foreground/70"
                                  : "text-foreground/50"
                              } text-right`}
                            >
                              {formatTime(message.timestamp)}
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {message.isRead ? (
                                    <Icon
                                      name="check-check"
                                      className="inline-block w-3 h-3"
                                    />
                                  ) : (
                                    <Icon
                                      name="check"
                                      className="inline-block w-3 h-3"
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {isCurrentUser && (
                            <img
                              src={currentUser?.profileImage}
                              alt={currentUser?.name}
                              className="w-8 h-8 rounded-full object-cover mx-2 mt-1"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-secondary/20">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-secondary/20 rounded-lg bg-secondary/10"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground p-2 rounded-lg disabled:opacity-50"
                disabled={isLoading || !newMessage.trim()}
              >
                <Icon name="send" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
