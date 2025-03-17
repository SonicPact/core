"use client";

import { useState } from "react";
import { sendChatRequest } from "@/app/actions/chat";

interface SendChatRequestProps {
  recipientWalletAddress: string;
  recipientName: string;
  onSuccess?: () => void;
  className?: string;
}

export default function SendChatRequest({
  recipientWalletAddress,
  recipientName,
  onSuccess,
  className = "",
}: SendChatRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      setSuccess(true);
      setIsOpen(false);
      setMessage("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={className}>
      {success ? (
        <div className="text-green-600 text-sm">
          Chat request sent successfully!
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Message
          </button>

          {isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">
                  Send a message to {recipientName}
                </h3>

                <form onSubmit={handleSendRequest}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      rows={4}
                      placeholder={`Introduce yourself to ${recipientName}...`}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 border border-border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
