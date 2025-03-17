import { PublicKey } from "@solana/web3.js";
import { verify } from "@noble/ed25519";
import { decode as bs58Decode, encode as bs58Encode } from "bs58";
import { createServerSupabaseClient } from "@/shared/utils/server-auth";
import { createAdminClient } from "@/shared/utils/server-supabase";

export const walletService = {
  /**
   * Verify a Solana wallet signature
   * @param message The message that was signed
   * @param signature The signature in base58 format
   * @param publicKey The public key of the wallet that signed the message
   * @returns Whether the signature is valid
   */
  async verifySignature(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      // Convert the message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Convert the signature from base58 to Uint8Array
      const signatureBytes = bs58Decode(signature);

      // Convert the public key from base58 to Uint8Array
      const publicKeyBytes = new PublicKey(publicKey).toBytes();

      // Verify the signature using @noble/ed25519
      const isValid = await verify(
        signatureBytes,
        messageBytes,
        publicKeyBytes
      );

      return isValid;
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  },

  /**
   * Generate a challenge message for the user to sign
   * @param walletAddress The wallet address of the user
   * @returns A challenge message
   */
  async generateChallengeMessage(walletAddress: string): Promise<string> {
    const timestamp = Date.now();
    return `Sign this message to authenticate with SonicPact: ${walletAddress} at ${timestamp}`;
  },

  /**
   * Create a custom JWT token for the wallet address
   * @param walletAddress The wallet address to create a token for
   * @returns The session data or null if there was an error
   */
  async createCustomJwtSession(walletAddress: string) {
    try {
      // Use the admin client to create a custom JWT token
      const supabaseAdmin = await createAdminClient();

      // Create a custom JWT token with the wallet address as the subject
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: `${walletAddress}@sonicpact.wallet`,
        password: crypto.randomUUID(), // Random password that won't be used
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress,
        },
      });

      if (error) {
        // If the user already exists, sign them in instead
        if (error.code === "email_exists") {
          const { data: signInData, error: signInError } =
            await supabaseAdmin.auth.admin.generateLink({
              type: "magiclink",
              email: `${walletAddress}@sonicpact.wallet`,
            });

          if (signInError) {
            console.error("Error generating sign-in link:", signInError);
            return null;
          }

          // Extract the token from the link
          const token = new URL(
            signInData.properties.action_link
          ).searchParams.get("token");

          if (!token) {
            console.error("No token found in sign-in link");
            return null;
          }

          // Exchange the token for a session
          const supabase = await createServerSupabaseClient();

          // Use signInWithOtp instead of verifyOtp to avoid code verifier error
          const { data: sessionData, error: sessionError } =
            await supabase.auth.verifyOtp({
              email: `${walletAddress}@sonicpact.wallet`,
              token: signInData.properties.email_otp,
              type: "email",
            });

          if (sessionError) {
            console.error("Error exchanging code for session:", sessionError);
            return null;
          }

          return sessionData;
        }

        console.error("Error creating user:", error);
        return null;
      }

      // Sign in the user to create a session
      const supabase = await createServerSupabaseClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.signInWithPassword({
          email: `${walletAddress}@sonicpact.wallet`,
          password: data.user.email_confirmed_at ? "password" : "password", // This won't be used in production
        });

      if (sessionError) {
        console.error("Error signing in user:", sessionError);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error("Error creating custom JWT session:", error);
      return null;
    }
  },

  /**
   * Sign out the current user
   * @returns Whether the sign out was successful
   */
  async signOut(): Promise<boolean> {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  },

  /**
   * Get the current authenticated wallet address from the session
   * @returns The wallet address or null if not authenticated
   */
  async getCurrentWalletAddress(): Promise<string | null> {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      // Get the wallet address from the user metadata
      return (data.user.user_metadata?.wallet_address as string) || null;
    } catch (error) {
      console.error("Error getting current wallet address:", error);
      return null;
    }
  },
};
