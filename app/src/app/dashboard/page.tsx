"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/shared/components/Icon";

interface Deal {
  id: string;
  name: string;
  description: string;
  status: "proposed" | "accepted" | "funded" | "completed" | "cancelled";
  counterparty: {
    id: string;
    name: string;
    profileImage: string;
  };
  amount: number;
  royaltyPercentage: number;
  createdAt: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    profileImage: string;
  };
  preview: string;
  unread: boolean;
  timestamp: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("deals");
  const [userType, setUserType] = useState<"studio" | "celebrity">("studio");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data, deals, and messages
  useEffect(() => {
    // This would be replaced with actual API calls to fetch data from the blockchain
    const fetchData = async () => {
      setIsLoading(true);

      // Mock data for now
      // Determine user type (would come from wallet/blockchain in real implementation)
      const mockUserType = "studio";
      setUserType(mockUserType as "studio" | "celebrity");

      // Mock deals
      const mockDeals: Deal[] = [
        {
          id: "1",
          name: "Game Character NFT Collaboration",
          description:
            "Use of likeness for a character in our upcoming RPG game",
          status: "proposed",
          counterparty: {
            id: "2",
            name: "Jane Smith",
            profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
          },
          amount: 5,
          royaltyPercentage: 7.5,
          createdAt: "2023-05-15T10:30:00Z",
        },
        {
          id: "2",
          name: "Sports Game Endorsement",
          description: "Featured athlete in our sports simulation game",
          status: "accepted",
          counterparty: {
            id: "6",
            name: "Emily Davis",
            profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
          },
          amount: 8,
          royaltyPercentage: 5,
          createdAt: "2023-05-10T14:20:00Z",
        },
        {
          id: "3",
          name: "Music Integration Deal",
          description: "License for music tracks to be used in-game",
          status: "completed",
          counterparty: {
            id: "3",
            name: "Mike Johnson",
            profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
          },
          amount: 12,
          royaltyPercentage: 10,
          createdAt: "2023-04-28T09:15:00Z",
        },
      ];

      // Mock messages
      const mockMessages: Message[] = [
        {
          id: "1",
          sender: {
            id: "2",
            name: "Jane Smith",
            profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
          },
          preview: "I've reviewed your proposal and I have a few questions...",
          unread: true,
          timestamp: "2023-05-16T11:42:00Z",
        },
        {
          id: "2",
          sender: {
            id: "6",
            name: "Emily Davis",
            profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
          },
          preview: "The terms look good. When can we finalize the deal?",
          unread: false,
          timestamp: "2023-05-15T16:30:00Z",
        },
        {
          id: "3",
          sender: {
            id: "5",
            name: "David Brown",
            profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
          },
          preview: "I'm interested in collaborating with your studio...",
          unread: true,
          timestamp: "2023-05-14T09:15:00Z",
        },
      ];

      setDeals(mockDeals);
      setMessages(mockMessages);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "funded":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDealsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Deals</h2>
        <Link
          href="/deals/create"
          className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          <Icon name="plus" className="mr-2" />
          Create New Deal
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-16 bg-secondary/5 rounded-lg">
          <Icon
            name="file-text"
            className="mx-auto text-4xl text-foreground/30 mb-4"
          />
          <h3 className="text-xl font-medium mb-2">No deals yet</h3>
          <p className="text-foreground/50 mb-4">
            {userType === "studio"
              ? "Start by exploring celebrities and creating a new deal."
              : "You haven't received any deal proposals yet."}
          </p>
          {userType === "studio" && (
            <Link
              href="/explore"
              className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
            >
              Explore Celebrities
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-background border border-secondary/20 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <img
                    src={deal.counterparty.profileImage}
                    alt={deal.counterparty.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold">{deal.name}</h3>
                    <p className="text-sm text-foreground/70">
                      {deal.description}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-foreground/50 mr-2">
                        with
                      </span>
                      <span className="text-sm font-medium">
                        {deal.counterparty.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      deal.status
                    )}`}
                  >
                    {deal.status}
                  </span>
                  <div className="mt-1 text-sm">
                    <span className="text-foreground/70">
                      {deal.amount} SOL
                    </span>
                    <span className="mx-1">+</span>
                    <span className="text-foreground/70">
                      {deal.royaltyPercentage}% royalty
                    </span>
                  </div>
                  <div className="text-xs text-foreground/50 mt-1">
                    Created on {formatDate(deal.createdAt)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/deals/${deal.id}`}
                  className="text-primary text-sm hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Your Messages</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-secondary/5 rounded-lg">
          <Icon
            name="message-square"
            className="mx-auto text-4xl text-foreground/30 mb-4"
          />
          <h3 className="text-xl font-medium mb-2">No messages yet</h3>
          <p className="text-foreground/50">
            {userType === "studio"
              ? "Start a conversation with a celebrity to discuss a potential collaboration."
              : "You haven't received any messages yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <Link
              key={message.id}
              href={`/chat/${message.id}`}
              className={`block bg-background border ${
                message.unread ? "border-primary/30" : "border-secondary/20"
              } rounded-lg p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={message.sender.profileImage}
                    alt={message.sender.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  {message.unread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3
                      className={`font-medium ${
                        message.unread ? "font-bold" : ""
                      }`}
                    >
                      {message.sender.name}
                    </h3>
                    <span className="text-xs text-foreground/50">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      message.unread ? "text-foreground" : "text-foreground/70"
                    } line-clamp-1`}
                  >
                    {message.preview}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground/70">
            {userType === "studio"
              ? "Manage your gaming studio's deals and communications with celebrities."
              : "Manage your celebrity profile, deals, and communications with gaming studios."}
          </p>
        </div>

        <div className="flex border-b border-secondary/20 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "deals"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/70 hover:text-foreground"
            }`}
            onClick={() => setActiveTab("deals")}
          >
            Deals
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "messages"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/70 hover:text-foreground"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Messages
            {messages.filter((m) => m.unread).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
                {messages.filter((m) => m.unread).length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/70 hover:text-foreground"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </div>

        {activeTab === "deals" && renderDealsTab()}
        {activeTab === "messages" && renderMessagesTab()}
        {activeTab === "profile" && (
          <div className="text-center py-16 bg-secondary/5 rounded-lg">
            <Icon
              name="user"
              className="mx-auto text-4xl text-foreground/30 mb-4"
            />
            <h3 className="text-xl font-medium mb-2">Profile Management</h3>
            <p className="text-foreground/50 mb-4">
              Profile management functionality will be implemented soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
