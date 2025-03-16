"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userService } from "@/services/userService";

// Session duration in seconds (1 day)
const SESSION_DURATION = 60 * 60 * 24;

/**
 * Verify a Solana wallet signature
 * Note: In a real implementation, you would use a proper signature verification
 * library like @noble/ed25519 or tweetnacl
 */
export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
) {
  try {
    // In a real implementation, you would verify the signature here
    // For now, we'll just assume it's valid for development purposes
    const isValid = true;

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Check if user exists
    const userData = await userService.getUserByWalletAddress(walletAddress);
    const exists = !!userData;

    // Set a session cookie
    const cookieStore = await cookies();
    cookieStore.set("wallet_session", walletAddress, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_DURATION,
      path: "/",
    });

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
 * Get the current authenticated wallet address from cookies
 */
export async function getAuthenticatedWallet() {
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get("wallet_session")?.value;
  return walletAddress;
}

/**
 * Check if user is authenticated and redirect if not
 */
export async function requireAuth() {
  const walletAddress = getAuthenticatedWallet();

  if (!walletAddress) {
    redirect("/");
  }

  return walletAddress;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("wallet_session");
  redirect("/");
}
