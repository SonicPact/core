"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/shared/components/Icon";

interface DealParticipant {
  id: string;
  name: string;
  profileImage: string;
  type: "studio" | "celebrity";
}

interface Deal {
  id: string;
  name: string;
  description: string;
  status: "proposed" | "accepted" | "funded" | "completed" | "cancelled";
  studio: DealParticipant;
  celebrity: DealParticipant;
  terms: {
    paymentAmount: number;
    royaltyPercentage: number;
    durationDays: number;
    usageRights: "limited" | "full" | "custom";
    exclusivity: boolean;
    additionalTerms?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DealDetailsPage() {
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<DealParticipant | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch deal data
  useEffect(() => {
    const fetchDealData = async () => {
      setIsLoading(true);

      // Mock data for now
      // In a real implementation, this would fetch from the blockchain

      // Mock current user (would come from wallet/blockchain)
      const mockCurrentUser: DealParticipant = {
        id: "studio1",
        name: "GameStudio XYZ",
        profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
        type: "studio",
      };

      // Mock deal data
      const mockDeal: Deal = {
        id: dealId,
        name: "Game Character NFT Collaboration",
        description: "Use of likeness for a character in our upcoming RPG game",
        status: "proposed",
        studio: mockCurrentUser,
        celebrity: {
          id: "2",
          name: "Jane Smith",
          profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
          type: "celebrity",
        },
        terms: {
          paymentAmount: 5,
          royaltyPercentage: 7.5,
          durationDays: 365,
          usageRights: "limited",
          exclusivity: false,
          additionalTerms:
            "Character will be featured in promotional materials for the game.",
        },
        createdAt: "2023-05-15T10:30:00Z",
        updatedAt: "2023-05-15T10:30:00Z",
      };

      setCurrentUser(mockCurrentUser);
      setDeal(mockDeal);
      setIsLoading(false);
    };

    fetchDealData();
  }, [dealId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const handleAcceptDeal = async () => {
    if (!deal || !currentUser || currentUser.type !== "celebrity") return;

    setIsProcessing(true);

    // In a real implementation, this would call the smart contract
    console.log("Accepting deal:", dealId);

    // Simulate API call
    setTimeout(() => {
      setDeal({
        ...deal,
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleFundDeal = async () => {
    if (!deal || !currentUser || currentUser.type !== "studio") return;

    setIsProcessing(true);

    // In a real implementation, this would call the smart contract
    console.log(
      "Funding deal:",
      dealId,
      "with amount:",
      deal.terms.paymentAmount
    );

    // Simulate API call
    setTimeout(() => {
      setDeal({
        ...deal,
        status: "funded",
        updatedAt: new Date().toISOString(),
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleCompleteDeal = async () => {
    if (!deal) return;

    setIsProcessing(true);

    // In a real implementation, this would call the smart contract
    console.log("Completing deal:", dealId);

    // Simulate API call
    setTimeout(() => {
      setDeal({
        ...deal,
        status: "completed",
        updatedAt: new Date().toISOString(),
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleCancelDeal = async () => {
    if (!deal) return;

    setIsProcessing(true);

    // In a real implementation, this would call the smart contract
    console.log("Cancelling deal:", dealId);

    // Simulate API call
    setTimeout(() => {
      setDeal({
        ...deal,
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      });
      setIsProcessing(false);
    }, 1500);
  };

  const renderActionButtons = () => {
    if (!deal || !currentUser) return null;

    const isCeleb = currentUser.type === "celebrity";
    const isStudio = currentUser.type === "studio";

    switch (deal.status) {
      case "proposed":
        return (
          <div className="flex gap-2">
            {isCeleb && (
              <button
                onClick={handleAcceptDeal}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Accept Deal"}
              </button>
            )}
            <button
              onClick={handleCancelDeal}
              disabled={isProcessing}
              className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Reject Deal"}
            </button>
          </div>
        );
      case "accepted":
        return (
          <div className="flex gap-2">
            {isStudio && (
              <button
                onClick={handleFundDeal}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : `Fund Deal (${deal.terms.paymentAmount} SOL)`}
              </button>
            )}
            <button
              onClick={handleCancelDeal}
              disabled={isProcessing}
              className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Cancel Deal"}
            </button>
          </div>
        );
      case "funded":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleCompleteDeal}
              disabled={isProcessing}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Complete Deal"}
            </button>
            <button
              onClick={handleCancelDeal}
              disabled={isProcessing}
              className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Cancel Deal"}
            </button>
          </div>
        );
      case "completed":
        return (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            Deal completed successfully
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            Deal cancelled
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 p-page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4">
            <Icon name="arrow-left" className="text-foreground/70" />
          </Link>
          <h1 className="text-3xl font-bold">Deal Details</h1>
        </div>

        {isLoading ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-secondary/10 rounded w-1/3"></div>
              <div className="h-4 bg-secondary/10 rounded w-1/2"></div>
              <div className="h-24 bg-secondary/10 rounded"></div>
              <div className="h-16 bg-secondary/10 rounded"></div>
              <div className="h-16 bg-secondary/10 rounded"></div>
            </div>
          </div>
        ) : deal ? (
          <div className="bg-background border border-secondary/20 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{deal.name}</h2>
                <p className="text-foreground/70 mt-1">{deal.description}</p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  deal.status
                )}`}
              >
                {deal.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-secondary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Studio</h3>
                <div className="flex items-center">
                  <img
                    src={deal.studio.profileImage}
                    alt={deal.studio.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-bold">{deal.studio.name}</p>
                    <p className="text-sm text-foreground/70">Gaming Studio</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Celebrity</h3>
                <div className="flex items-center">
                  <img
                    src={deal.celebrity.profileImage}
                    alt={deal.celebrity.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-bold">{deal.celebrity.name}</p>
                    <p className="text-sm text-foreground/70">Celebrity</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Deal Terms</h3>
              <div className="bg-secondary/5 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground/70">Payment Amount</p>
                    <p className="font-medium">
                      {deal.terms.paymentAmount} SOL
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/70">
                      Royalty Percentage
                    </p>
                    <p className="font-medium">
                      {deal.terms.royaltyPercentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/70">Duration</p>
                    <p className="font-medium">
                      {deal.terms.durationDays} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/70">Usage Rights</p>
                    <p className="font-medium capitalize">
                      {deal.terms.usageRights}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/70">Exclusivity</p>
                    <p className="font-medium">
                      {deal.terms.exclusivity ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {deal.terms.additionalTerms && (
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    <p className="text-sm text-foreground/70 mb-1">
                      Additional Terms
                    </p>
                    <p>{deal.terms.additionalTerms}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Timeline</h3>
              <div className="bg-secondary/5 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm mr-3">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Deal Created</p>
                    <p className="text-sm text-foreground/70">
                      {formatDate(deal.createdAt)}
                    </p>
                  </div>
                </div>

                {deal.status !== "proposed" && (
                  <div className="ml-4 border-l-2 border-primary/30 pl-7 py-2">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Deal Accepted</p>
                        <p className="text-sm text-foreground/70">
                          {formatDate(deal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(deal.status === "funded" || deal.status === "completed") && (
                  <div className="ml-4 border-l-2 border-primary/30 pl-7 py-2">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Deal Funded</p>
                        <p className="text-sm text-foreground/70">
                          {formatDate(deal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {deal.status === "completed" && (
                  <div className="ml-4 border-l-2 border-primary/30 pl-7 py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Deal Completed</p>
                        <p className="text-sm text-foreground/70">
                          {formatDate(deal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {deal.status === "cancelled" && (
                  <div className="ml-4 border-l-2 border-red-300 pl-7 py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm mr-3">
                        <Icon name="x" className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">Deal Cancelled</p>
                        <p className="text-sm text-foreground/70">
                          {formatDate(deal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Link
                href={`/chat/${deal.celebrity.id}`}
                className="flex items-center text-primary hover:underline"
              >
                <Icon name="message-circle" className="mr-1" />
                Message{" "}
                {currentUser?.type === "studio" ? "Celebrity" : "Studio"}
              </Link>

              {renderActionButtons()}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/5 rounded-lg">
            <Icon
              name="file-x"
              className="mx-auto text-4xl text-foreground/30 mb-4"
            />
            <h3 className="text-xl font-medium mb-2">Deal not found</h3>
            <p className="text-foreground/50 mb-4">
              The deal you're looking for doesn't exist or you don't have access
              to it.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
