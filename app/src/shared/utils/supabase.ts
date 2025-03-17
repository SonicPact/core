/**
 * Client-side Supabase client
 *
 * This file exports a Supabase client for use in client components.
 * It should be imported only in client components or context providers.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/database.generated";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database from client components
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
