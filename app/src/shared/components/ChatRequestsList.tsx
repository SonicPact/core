"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateChatRequestStatus } from "@/app/actions/chat";
import Icon from "./Icon";

interface ChatRequestProps {
  id: string;
  status: string;
  message?: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  recipient?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
}

interface ChatRequestsListProps {
  requests: {
    sent: ChatRequestProps[];
    received: ChatRequestProps[];
  };
  onStatusChange?: () => void;
}

export default function ChatRequestsList({
  requests,
  onStatusChange,
}: ChatRequestsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { sent, received } = requests;
  const pendingReceived = received.filter((req) => req.status === "pending");
  const pendingSent = sent.filter((req) => req.status === "pending");

  const handleUpdateStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setProcessingId(requestId);
      setError(null);

      console.log(`Updating chat request ${requestId} to ${status}...`);
      const result = await updateChatRequestStatus(requestId, status);
      console.log("Chat request update result:", result);

      if (!result.success) {
        setError(result.error || `Failed to ${status} chat request`);
        return;
      }

      // If the request was accepted and we have a chat ID, redirect to the chat
      if (status === "accepted" && result.chatId) {
        console.log(`Chat created with ID: ${result.chatId}`);
        // Instead of redirecting immediately, trigger the onStatusChange callback
        if (onStatusChange) {
          console.log("Calling onStatusChange callback to refresh chats...");
          await onStatusChange();
        }

        // Now redirect to the chat
        router.push(`/chat/${result.chatId}`);
      } else if (onStatusChange) {
        console.log("Calling onStatusChange callback...");
        await onStatusChange();
      }
    } catch (err) {
      console.error("Error updating chat request status:", err);
      setError((err as Error).message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (pendingReceived.length === 0 && pendingSent.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Chat Requests</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingReceived.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-2">Received Requests</h4>
            <div className="space-y-3">
              {pendingReceived.map((request) => (
                <div
                  key={request.id}
                  className="border border-border rounded-lg p-4 bg-background"
                >
                  <div className="flex items-center mb-3">
                    {request.sender?.profile_image_url ? (
                      <img
                        src={request.sender.profile_image_url}
                        alt={request.sender.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">
                          {request.sender?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {request.sender?.name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-foreground/50">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleUpdateStatus(request.id, "rejected")}
                      className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                      disabled={processingId === request.id}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, "accepted")}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? "Processing..." : "Accept"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingSent.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-2">Sent Requests</h4>
            <div className="space-y-3">
              {pendingSent.map((request) => (
                <div
                  key={request.id}
                  className="border border-border rounded-lg p-4 bg-background"
                >
                  <div className="flex items-center mb-3">
                    {request.recipient?.profile_image_url ? (
                      <img
                        src={request.recipient.profile_image_url}
                        alt={request.recipient.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">
                          {request.recipient?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {request.recipient?.name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-foreground/50">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Awaiting response
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
