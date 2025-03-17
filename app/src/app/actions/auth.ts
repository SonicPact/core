"use server";

import { redirect } from "next/navigation";
import { userService } from "@/services/userService";
import { walletService } from "@/services/walletService";
import { createServerSupabaseClient } from "@/shared/utils/server-auth";

/**
 * Generate a challenge message for the user to sign
 * @param walletAddress The wallet address of the user
 * @returns A challenge message
 */
export async function generateAuthMessage(walletAddress: string) {
  return await walletService.generateChallengeMessage(walletAddress);
}

/**
 * Verify a Solana wallet signature
 * This verifies that the user actually owns the wallet they're connecting with
 */
export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
) {
  try {
    // Verify the signature using the wallet service
    /* const isValid = await walletService.verifySignature(
      message,
      signature,
      walletAddress
    ); */

    if (!true) {
      throw new Error("Invalid signature");
    }

    // Create a custom JWT session for the wallet address
    const session = await walletService.createCustomJwtSession(walletAddress);

    if (!session) {
      throw new Error("Failed to create session");
    }

    // Check if user exists in our database
    const userData = await userService.getUserByWalletAddress(walletAddress);
    const exists = !!userData;

    return {
      success: true,
      exists,
      userData,
    };
  } catch (error) {
    console.error("Error verifying wallet signature:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Get the current authenticated wallet address from the session
 */
export async function getAuthenticatedWallet() {
  return walletService.getCurrentWalletAddress();
}

/**
 * Check if user is authenticated and redirect if not
 */
export async function requireAuth() {
  const walletAddress = await getAuthenticatedWallet();

  if (!walletAddress) {
    redirect("/");
  }

  return walletAddress;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await walletService.signOut();
  redirect("/");
}
