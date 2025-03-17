"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkExistingChat, sendChatRequest } from "@/app/actions/chat";
import { useWallet } from "@solana/wallet-adapter-react";

interface ChatButtonProps {
  recipientWalletAddress: string;
  recipientName: string;
  className?: string;
}

export default function ChatButton({
  recipientWalletAddress,
  recipientName,
  className = "",
}: ChatButtonProps) {
  const router = useRouter();
  const { connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleClick = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await checkExistingChat(recipientWalletAddress);

      if (!result.success) {
        setError(result.error || "Failed to check chat status");
        return;
      }

      // If a chat already exists, redirect to it
      if (result.exists && result.chatId) {
        router.push(`/chat/${result.chatId}`);
        return;
      }

      // If there's a pending request, show appropriate message
      if (result.pendingRequest) {
        if (result.pendingRequest.sender_id === result.otherUser?.id) {
          // The other user sent a request to us
          router.push(`/chat/requests`);
        } else {
          // We sent a request to the other user
          setError("You already sent a chat request to this user");
        }
        return;
      }

      // Otherwise, open the modal to send a chat request
      setIsModalOpen(true);
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientWalletAddress || sending) return;

    try {
      setSending(true);
      setError(null);

      const result = await sendChatRequest(recipientWalletAddress, message);

      if (!result.success) {
        setError(result.error || "Failed to send chat request");
        return;
      }

      // Close the modal and show success message
      setIsModalOpen(false);
      router.push("/chat/requests");
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-block w-5 h-5 border-t-2 border-primary-foreground rounded-full animate-spin"></span>
        ) : (
          "Message"
        )}
      </button>

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Send a message to {recipientName}
            </h3>

            <form onSubmit={handleSendRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                  rows={4}
                  placeholder={`Introduce yourself to ${recipientName}...`}
                  required
                />
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                  disabled={sending || !message.trim()}
                >
                  {sending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
