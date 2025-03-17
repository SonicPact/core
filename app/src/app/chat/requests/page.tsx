"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChatRequests, updateChatRequestStatus } from "@/app/actions/chat";
import { supabase } from "@/shared/utils/supabase";

export default function ChatRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatRequests, setChatRequests] = useState<{
    sent: any[];
    received: any[];
  }>({
    sent: [],
    received: [],
  });
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch chat requests and subscribe to real-time updates
  useEffect(() => {
    const fetchChatRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getChatRequests();
        if (!result.success) {
          setError(result.error || "Failed to load chat requests");
          return;
        }

        setChatRequests(result.chatRequests || { sent: [], received: [] });
      } catch (err) {
        setError((err as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChatRequests();

    // Subscribe to chat request changes
    const channel = supabase
      .channel("chat_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_requests",
        },
        async () => {
          // Refresh the chat requests
          fetchChatRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setProcessingId(requestId);
      setError(null);

      const result = await updateChatRequestStatus(requestId, status);
      if (!result.success) {
        setError(result.error || `Failed to ${status} chat request`);
        return;
      }

      // If the request was accepted and we have a chat ID, redirect to the chat
      if (status === "accepted" && result.chatId) {
        router.push(`/chat/${result.chatId}`);
      }

      // The real-time subscription will update the list
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setProcessingId(null);
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

  const hasRequests =
    chatRequests.received.length > 0 || chatRequests.sent.length > 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Chat Requests</h1>

      {!hasRequests ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">No chat requests</h3>
          <p className="text-foreground/70 mb-4">
            You don't have any pending chat requests. Start a conversation with
            a celebrity or studio from the explore page.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Explore Users
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Received requests */}
          {chatRequests.received.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Received Requests</h2>
              <div className="space-y-4">
                {chatRequests.received.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4"
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
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    )}

                    {request.status === "pending" ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() =>
                            handleUpdateStatus(request.id, "rejected")
                          }
                          className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
                          disabled={processingId === request.id}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(request.id, "accepted")
                          }
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id
                            ? "Processing..."
                            : "Accept"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs ${
                            request.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status === "accepted"
                            ? "Accepted"
                            : "Declined"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent requests */}
          {chatRequests.sent.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sent Requests</h2>
              <div className="space-y-4">
                {chatRequests.sent.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4"
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
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    )}

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                          request.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status === "accepted"
                          ? "Accepted"
                          : request.status === "rejected"
                          ? "Declined"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
