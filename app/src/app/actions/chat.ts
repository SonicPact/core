"use server";

import { chatService } from "@/services/chatService";
import { getAuthenticatedWallet } from "./auth";
import { userService } from "@/services/userService";
import { createServerSupabaseClient } from "@/shared/utils/server-auth";

/**
 * Send a chat request to another user
 */
export async function sendChatRequest(
  recipientWalletAddress: string,
  message?: string
) {
  try {
    // Get the authenticated wallet
    const senderWalletAddress = await getAuthenticatedWallet();
    if (!senderWalletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the sender and recipient user IDs
    const sender = await userService.getUserByWalletAddress(
      senderWalletAddress
    );
    const recipient = await userService.getUserByWalletAddress(
      recipientWalletAddress
    );

    if (!sender || !recipient) {
      return { success: false, error: "User not found" };
    }

    console.log("sender", sender);
    console.log("recipient", recipient);

    const supabaseClient = await createServerSupabaseClient();
    const user = await supabaseClient.auth.getUser();

    console.log("user", user);

    // Send the chat request
    const chatRequest = await chatService.sendChatRequest(
      sender.id,
      recipient.id,
      message
    );

    return { success: !!chatRequest, chatRequest };
  } catch (error) {
    console.error("Error in sendChatRequest action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all chat requests for the current user
 */
export async function getChatRequests() {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get chat requests
    const chatRequests = await chatService.getChatRequests(user.id);

    // For each request, get the sender/recipient details
    const enrichedRequests = {
      sent: await Promise.all(
        chatRequests.sent.map(async (request) => {
          const recipient = await userService.getUserById(request.recipient_id);
          return {
            ...request,
            recipient: recipient || { name: "Unknown User" },
          };
        })
      ),
      received: await Promise.all(
        chatRequests.received.map(async (request) => {
          const sender = await userService.getUserById(request.sender_id);
          return {
            ...request,
            sender: sender || { name: "Unknown User" },
          };
        })
      ),
    };

    return { success: true, chatRequests: enrichedRequests };
  } catch (error) {
    console.error("Error in getChatRequests action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update the status of a chat request
 */
export async function updateChatRequestStatus(
  requestId: string,
  status: "accepted" | "rejected"
) {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Update the chat request status
    const updatedRequest = await chatService.updateChatRequestStatus(
      requestId,
      status
    );

    if (!updatedRequest) {
      return { success: false, error: "Failed to update chat request" };
    }

    // If the request was accepted, find the newly created chat
    let chatId = null;
    if (status === "accepted") {
      // Get the other user's ID
      const otherUserId =
        updatedRequest.sender_id === user.id
          ? updatedRequest.recipient_id
          : updatedRequest.sender_id;

      // Find the chat between these users
      const chat = await chatService.findChatBetweenUsers(user.id, otherUserId);
      if (chat) {
        chatId = chat.id;
      }
    }

    return {
      success: true,
      request: updatedRequest,
      chatId,
    };
  } catch (error) {
    console.error("Error in updateChatRequestStatus action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all chats for the current user
 */
export async function getUserChats() {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the chats
    const chats = await chatService.getUserChats(user.id);

    return { success: true, chats };
  } catch (error) {
    console.error("Error in getUserChats action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get a single chat by ID
 */
export async function getChatById(chatId: string) {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the chat
    const chat = await chatService.getChatById(chatId);
    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    // Mark messages as read
    await chatService.markMessagesAsRead(chatId, user.id);

    return { success: true, ...chat };
  } catch (error) {
    console.error("Error in getChatById action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send a message in a chat
 */
export async function sendMessage(chatId: string, content: string) {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Send the message
    const message = await chatService.sendMessage(chatId, user.id, content);

    return { success: !!message, message };
  } catch (error) {
    console.error("Error in sendMessage action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get unread message count for the current user
 */
export async function getUnreadMessageCount() {
  try {
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get the unread message count
    const count = await chatService.getUnreadMessageCount(user.id);

    return { success: true, count };
  } catch (error) {
    console.error("Error in getUnreadMessageCount action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Check if a chat exists between the current user and another user
 */
export async function checkExistingChat(otherUserWalletAddress: string) {
  try {
    // Get the authenticated wallet
    const currentWalletAddress = await getAuthenticatedWallet();
    if (!currentWalletAddress) {
      return { success: false, error: "Not authenticated" };
    }

    // Get both user IDs
    const currentUser = await userService.getUserByWalletAddress(
      currentWalletAddress
    );
    const otherUser = await userService.getUserByWalletAddress(
      otherUserWalletAddress
    );

    if (!currentUser || !otherUser) {
      return { success: false, error: "User not found" };
    }

    // Check if there's an existing chat between these users
    const existingChat = await chatService.findChatBetweenUsers(
      currentUser.id,
      otherUser.id
    );

    if (existingChat) {
      return {
        success: true,
        exists: true,
        chatId: existingChat.id,
      };
    }

    // Check if there's a pending chat request
    const pendingRequest = await chatService.findPendingChatRequest(
      currentUser.id,
      otherUser.id
    );

    return {
      success: true,
      exists: false,
      pendingRequest: pendingRequest || null,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        walletAddress: otherUser.wallet_address,
      },
    };
  } catch (error) {
    console.error("Error in checkExistingChat action:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all chats and chat requests for the dashboard
 */
export async function getDashboardChats() {
  try {
    console.log("Starting getDashboardChats...");
    // Get the authenticated wallet
    const walletAddress = await getAuthenticatedWallet();
    if (!walletAddress) {
      console.log("No authenticated wallet found");
      return { success: false, error: "Not authenticated" };
    }
    console.log("Authenticated wallet:", walletAddress);

    // Get the user ID
    const user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      console.log("User not found for wallet:", walletAddress);
      return { success: false, error: "User not found" };
    }
    console.log("Found user:", user.id, user.name);

    // Get the chats
    console.log("Fetching chats for user ID:", user.id);
    try {
      const chats = await chatService.getUserChats(user.id);
      console.log("Retrieved chats count:", chats.length);

      // Get chat requests
      console.log("Fetching chat requests for user ID:", user.id);
      const chatRequests = await chatService.getChatRequests(user.id);
      console.log("Retrieved chat requests:", {
        sent: chatRequests.sent.length,
        received: chatRequests.received.length,
      });

      // For each request, get the sender/recipient details
      console.log("Enriching chat requests with user details...");
      const enrichedRequests = {
        sent: await Promise.all(
          chatRequests.sent.map(async (request) => {
            try {
              const recipient = await userService.getUserById(
                request.recipient_id
              );
              return {
                ...request,
                recipient: recipient || { name: "Unknown User" },
              };
            } catch (err) {
              console.error("Error enriching sent request:", err);
              return {
                ...request,
                recipient: { name: "Unknown User" },
              };
            }
          })
        ),
        received: await Promise.all(
          chatRequests.received.map(async (request) => {
            try {
              const sender = await userService.getUserById(request.sender_id);
              return {
                ...request,
                sender: sender || { name: "Unknown User" },
              };
            } catch (err) {
              console.error("Error enriching received request:", err);
              return {
                ...request,
                sender: { name: "Unknown User" },
              };
            }
          })
        ),
      };

      console.log("Completed getDashboardChats, returning data");
      return {
        success: true,
        chats: chats.filter(Boolean), // Filter out any null values
        chatRequests: enrichedRequests,
      };
    } catch (err) {
      console.error("Error in getDashboardChats fetching data:", err);
      return {
        success: false,
        error: "Error fetching chats and requests",
        chats: [],
        chatRequests: { sent: [], received: [] },
      };
    }
  } catch (error) {
    console.error("Error in getDashboardChats action:", error);
    return {
      success: false,
      error: (error as Error).message,
      chats: [],
      chatRequests: { sent: [], received: [] },
    };
  }
}
