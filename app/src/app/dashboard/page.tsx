"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/shared/components/Icon";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { getUserByWalletAddress } from "../actions/user";

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  // Check if wallet is connected
  useEffect(() => {
    if (!connected) {
      // Redirect to home after a short delay
      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [connected, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!publicKey) return;

      try {
        // Get user profile from server action
        const userData = await getUserByWalletAddress(publicKey.toString());

        if (!userData) {
          // If user doesn't exist, redirect to home page
          router.push("/");
          return;
        }

        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [publicKey, router]);

  // Fetch deals and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !userProfile) return;

      setIsLoading(true);

      try {
        // In a real implementation, this would fetch from the blockchain/database
        // Mock data for now
        const mockDeals: Deal[] = [
          {
            id: "1",
            name: "Game Character NFT",
            description: "Character based on your likeness for our RPG game",
            status: "proposed",
            counterparty: {
              id: "studio1",
              name: "GameStudio XYZ",
              profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
            },
            amount: 5,
            royaltyPercentage: 7.5,
            createdAt: "2023-05-15T10:30:00Z",
          },
          {
            id: "2",
            name: "Promotional NFT Collection",
            description: "Limited edition NFTs for game launch",
            status: "accepted",
            counterparty: {
              id: "celeb2",
              name: "Jane Smith",
              profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
            },
            amount: 3,
            royaltyPercentage: 5,
            createdAt: "2023-05-10T14:20:00Z",
          },
          {
            id: "3",
            name: "In-Game Item Collaboration",
            description: "Special items with your branding",
            status: "completed",
            counterparty: {
              id: "studio3",
              name: "Indie Games Inc",
              profileImage: "https://randomuser.me/api/portraits/men/30.jpg",
            },
            amount: 2,
            royaltyPercentage: 3,
            createdAt: "2023-04-20T09:15:00Z",
          },
        ];

        const mockMessages: Message[] = [
          {
            id: "1",
            sender: {
              id: "studio1",
              name: "GameStudio XYZ",
              profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
            },
            preview:
              "Hi, we're interested in collaborating with you for our upcoming game...",
            unread: true,
            timestamp: "2023-05-15T10:30:00Z",
          },
          {
            id: "2",
            sender: {
              id: "celeb2",
              name: "Jane Smith",
              profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
            },
            preview:
              "Thanks for your proposal. I have a few questions about the terms...",
            unread: false,
            timestamp: "2023-05-14T15:45:00Z",
          },
          {
            id: "3",
            sender: {
              id: "studio3",
              name: "Indie Games Inc",
              profileImage: "https://randomuser.me/api/portraits/men/30.jpg",
            },
            preview:
              "The collaboration was a success! We'd like to discuss a follow-up project...",
            unread: false,
            timestamp: "2023-05-12T11:20:00Z",
          },
        ];

        setDeals(mockDeals);
        setMessages(mockMessages);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [publicKey, userProfile]);

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
        <h2 className="text-2xl font-bold">Your Deals</h2>
        <Link
          href="/deals/create"
          className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          <Icon name="plus" className="mr-2" />
          Create Deal
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-secondary/10 h-32 rounded-lg"
            ></div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-16 bg-secondary/5 rounded-lg">
          <Icon
            name="file-x"
            className="mx-auto text-4xl text-foreground/30 mb-4"
          />
          <h3 className="text-xl font-medium mb-2">No deals yet</h3>
          <p className="text-foreground/50 mb-4">
            Start by creating a new deal or responding to incoming requests.
          </p>
          <Link
            href="/deals/create"
            className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            <Icon name="plus" className="mr-2" />
            Create Deal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <Link
              href={`/deals/${deal.id}`}
              key={deal.id}
              className="block bg-background border border-secondary/20 rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{deal.name}</h3>
                  <p className="text-foreground/70 text-sm mb-2">
                    {deal.description}
                  </p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    deal.status
                  )}`}
                >
                  {deal.status}
                </span>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center">
                  <img
                    src={deal.counterparty.profileImage}
                    alt={deal.counterparty.name}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="text-sm">{deal.counterparty.name}</span>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">
                    {deal.amount} SOL + {deal.royaltyPercentage}% royalties
                  </div>
                  <div className="text-xs text-foreground/50">
                    Created {formatDate(deal.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Messages</h2>
        <Link
          href="/chat/new"
          className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          <Icon name="message-square-plus" className="mr-2" />
          New Message
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-secondary/10 h-20 rounded-lg"
            ></div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-secondary/5 rounded-lg">
          <Icon
            name="message-square-x"
            className="mx-auto text-4xl text-foreground/30 mb-4"
          />
          <h3 className="text-xl font-medium mb-2">No messages yet</h3>
          <p className="text-foreground/50 mb-4">
            Start a conversation with a celebrity or studio.
          </p>
          <Link
            href="/chat/new"
            className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            <Icon name="message-square-plus" className="mr-2" />
            New Message
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <Link
              href={`/chat/${message.id}`}
              key={message.id}
              className={`block p-4 rounded-lg transition-colors ${
                message.unread
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-background border border-secondary/20 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center">
                <img
                  src={message.sender.profileImage}
                  alt={message.sender.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold truncate">
                      {message.sender.name}
                    </h3>
                    <span className="text-xs text-foreground/50">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      message.unread ? "font-medium" : "text-foreground/70"
                    }`}
                  >
                    {message.preview}
                  </p>
                </div>
                {message.unread && (
                  <div className="ml-2 w-3 h-3 rounded-full bg-primary"></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

      {isLoading || !userProfile ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-secondary/10 h-40 rounded-lg"></div>
          <div className="animate-pulse bg-secondary/10 h-20 rounded-lg"></div>
          <div className="animate-pulse bg-secondary/10 h-20 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-background border border-secondary/20 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {userProfile.profile_image_url ? (
                <img
                  src={userProfile.profile_image_url}
                  alt={userProfile.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Icon name="user" className="text-5xl text-foreground/30" />
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold">{userProfile.name}</h3>
                <p className="text-foreground/70 capitalize mb-2">
                  {userProfile.user_type}
                  {userProfile.category && ` • ${userProfile.category}`}
                  {userProfile.verified && (
                    <span className="inline-flex items-center ml-2 text-primary">
                      <Icon name="check-circle" className="mr-1" />
                      Verified
                    </span>
                  )}
                </p>
                <p className="mb-4">{userProfile.description}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {userProfile.website && (
                    <a
                      href={userProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm bg-secondary/10 px-3 py-1 rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                      <Icon name="globe" className="mr-1" />
                      Website
                    </a>
                  )}
                  {userProfile.twitter_url && (
                    <a
                      href={userProfile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm bg-secondary/10 px-3 py-1 rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                      <Icon name="twitter" className="mr-1" />
                      Twitter
                    </a>
                  )}
                  {userProfile.instagram_url && (
                    <a
                      href={userProfile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm bg-secondary/10 px-3 py-1 rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                      <Icon name="instagram" className="mr-1" />
                      Instagram
                    </a>
                  )}
                  {userProfile.discord_url && (
                    <a
                      href={userProfile.discord_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm bg-secondary/10 px-3 py-1 rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                      <Icon name="message-square" className="mr-1" />
                      Discord
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border border-secondary/20 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Wallet Information</h3>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <p className="font-mono break-all">
                {userProfile.wallet_address}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/profile/edit"
              className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Icon name="edit" className="mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-7xl mx-auto">
        {!connected ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="mb-6">
              You need to connect your wallet to access your dashboard.
            </p>
            <div className="flex justify-center mb-4">
              <WalletMultiButton className="wallet-adapter-button-custom" />
            </div>
            <p className="text-sm text-foreground/70">
              You will be redirected to the home page in a few seconds...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-foreground/70">
                Manage your deals, messages, and profile
              </p>
            </div>

            <div className="mb-8">
              <div className="border-b border-secondary/20">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("deals")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "deals"
                        ? "border-primary text-primary"
                        : "border-transparent text-foreground/70 hover:text-foreground/90 hover:border-secondary/50"
                    }`}
                  >
                    Deals
                  </button>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "messages"
                        ? "border-primary text-primary"
                        : "border-transparent text-foreground/70 hover:text-foreground/90 hover:border-secondary/50"
                    }`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "profile"
                        ? "border-primary text-primary"
                        : "border-transparent text-foreground/70 hover:text-foreground/90 hover:border-secondary/50"
                    }`}
                  >
                    Profile
                  </button>
                </nav>
              </div>
            </div>

            <div>
              {activeTab === "deals" && renderDealsTab()}
              {activeTab === "messages" && renderMessagesTab()}
              {activeTab === "profile" && renderProfileTab()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
