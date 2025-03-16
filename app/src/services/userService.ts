import { supabase } from "@/shared/utils/supabase";
import { Database } from "@/database.generated";

export const userService = {
  /**
   * Create a new user profile
   */
  async createUser(userData: Database["public"]["Tables"]["users"]["Insert"]) {
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return data?.[0];
  },

  /**
   * Get a user profile by wallet address
   */
  async getUserByWalletAddress(walletAddress: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data;
  },

  /**
   * Update a user profile
   */
  async updateUser(
    walletAddress: string,
    userData: Database["public"]["Tables"]["users"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("wallet_address", walletAddress)
      .select();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return data?.[0];
  },

  /**
   * Get all celebrities
   */
  async getCelebrities() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_type", "celebrity");

    if (error) {
      throw new Error(`Error fetching celebrities: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get all studios
   */
  async getStudios() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_type", "studio");

    if (error) {
      throw new Error(`Error fetching studios: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Check if a user exists by wallet address
   */
  async userExists(walletAddress: string) {
    const user = await this.getUserByWalletAddress(walletAddress);
    return !!user;
  },
};
