"use server";

import type { Database } from "@/database.generated";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with admin privileges
 *
 * IMPORTANT: This should ONLY be used in server contexts (Server Components, API Routes, etc.)
 * Never import this in client components as it would expose the service role key.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
/**
 * Creates a Supabase admin client with the service role key
 * @returns A Supabase client with admin privileges
 * @throws Error if the service role key is not set
 */
export async function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
}
