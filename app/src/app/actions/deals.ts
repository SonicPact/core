"use server";

import { createServerSupabaseClient } from "@/shared/utils/server-auth";
import { revalidatePath } from "next/cache";
import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "@/shared/utils/idl/sonicpact"; // This would be generated from your IDL

// This would normally be environment variables
const PROGRAM_ID = "GrujK4NkA76V7BvkS66t1gAPXJKJgmF6dXoRGiq7CeoM";
const RPC_URL = "https://api.devnet.solana.com";

/**
 * Get a deal by ID from the database
 */
export async function getDealById(dealId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      studio:studio_id(name, profile_image_url),
      celebrity:celebrity_id(name, profile_image_url)
    `
    )
    .eq("id", dealId)
    .single();

  if (error) {
    console.error("Error fetching deal:", error);
    return null;
  }

  return data;
}

/**
 * Get all deals for the current user
 */
export async function getUserDeals() {
  const supabase = await createServerSupabaseClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { studio_deals: [], celebrity_deals: [] };
  }

  const { data: studioDeals, error: studioError } = await supabase
    .from("deals")
    .select(
      `
      *,
      studio:studio_id(name, profile_image_url),
      celebrity:celebrity_id(name, profile_image_url)
    `
    )
    .eq("studio_id", user.user.id);

  const { data: celebrityDeals, error: celebrityError } = await supabase
    .from("deals")
    .select(
      `
      *,
      studio:studio_id(name, profile_image_url),
      celebrity:celebrity_id(name, profile_image_url)
    `
    )
    .eq("celebrity_id", user.user.id);

  if (studioError || celebrityError) {
    console.error("Error fetching deals:", studioError || celebrityError);
  }

  return {
    studio_deals: studioDeals || [],
    celebrity_deals: celebrityDeals || [],
  };
}

/**
 * Complete a deal and mint an NFT
 * 
 * NOTE: This is a simplified version for build purposes
 * The actual implementation would interact with the Solana blockchain
 */
export async function completeDeal(
  dealId: string,
  walletAdapter: any,
  nftMint: string
) {
  if (!walletAdapter?.connected) {
    return { success: false, message: "Wallet not connected" };
  }

  try {
    // Get deal data from the database
    const dealData = await getDealById(dealId);
    if (!dealData) {
      return { success: false, message: "Deal not found" };
    }

    // Check if deal is in the right state
    if (dealData.status !== "funded") {
      return { success: false, message: "Deal must be in funded state to complete" };
    }

    // For build purposes, we'll skip the blockchain interaction
    // In a real implementation, this would include all the Anchor/Solana code

    // Update the deal in the database
    const supabase = await createServerSupabaseClient();
    await supabase
      .from("deals")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        nft_mint_address: nftMint,
      })
      .eq("id", dealId);

    revalidatePath(`/deals/${dealId}`);
    revalidatePath(`/deals/${dealId}/completion`);
    revalidatePath("/dashboard");

    return { success: true, message: "Deal completed successfully" };
  } catch (error) {
    console.error("Error completing deal:", error);
    return { success: false, message: (error as Error).message };
  }
}
