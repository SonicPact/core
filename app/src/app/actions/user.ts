"use server";

import { userService } from "@/services/userService";
import { getAuthenticatedWallet } from "./auth";
import { withAuth } from "@/shared/utils/server-auth";

/**
 * Check if a user with the given wallet address exists
 */
export async function checkUserExists(walletAddress: string) {
  try {
    const userData = await userService.getUserByWalletAddress(walletAddress);
    return { exists: !!userData, userData };
  } catch (error) {
    console.error("Error in checkUserExists:", error);
    throw error;
  }
}

/**
 * Create a new user profile
 */
export async function createUser(userData: {
  wallet_address: string;
  user_type: "studio" | "celebrity";
  name: string;
  description?: string;
  profile_image_url?: string;
  website?: string;
  twitter_url?: string;
  instagram_url?: string;
  discord_url?: string;
  category?: string;
  verification_document_url?: string;
}) {
  // Verify that the authenticated wallet matches the wallet being used to create the profile
  const authenticatedWallet = await getAuthenticatedWallet();

  if (!authenticatedWallet || authenticatedWallet !== userData.wallet_address) {
    throw new Error("Unauthorized: Wallet address mismatch");
  }

  try {
    const newUser = await userService.createUser(userData);
    return newUser;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

/**
 * Get user profile by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string) {
  try {
    const userData = await userService.getUserByWalletAddress(walletAddress);
    return userData;
  } catch (error) {
    console.error("Error in getUserByWalletAddress:", error);
    throw error;
  }
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile() {
  const walletAddress = await getAuthenticatedWallet();

  if (!walletAddress) {
    return null;
  }

  try {
    return await userService.getUserByWalletAddress(walletAddress);
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    return null;
  }
}

/**
 * Get all celebrities
 */
export async function getCelebrities() {
  try {
    const celebrities = await userService.getCelebrities();
    return celebrities;
  } catch (error) {
    console.error("Error in getCelebrities:", error);
    throw error;
  }
}

/**
 * Get all studios
 */
export async function getStudios() {
  try {
    const studios = await userService.getStudios();
    return studios;
  } catch (error) {
    console.error("Error in getStudios:", error);
    throw error;
  }
}

/**
 * Update a user profile
 */
export async function updateUser(
  walletAddress: string,
  userData: Partial<{
    name: string;
    description: string;
    profile_image_url: string;
    website: string;
    twitter_url: string;
    instagram_url: string;
    discord_url: string;
    category: string;
  }>
) {
  // Verify that the authenticated wallet matches the wallet being updated
  const authenticatedWallet = await getAuthenticatedWallet();

  if (!authenticatedWallet || authenticatedWallet !== walletAddress) {
    throw new Error("Unauthorized: Wallet address mismatch");
  }

  try {
    const updatedUser = await userService.updateUser(walletAddress, userData);
    return updatedUser;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}
