"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/database.generated";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: object }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
/**
 * Gets the current user's session from the server
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Type for the standard error response
 */
export type AuthErrorResponse = {
  success: false;
  error: string;
  status: number;
};

/**
 * Executes a function with the authenticated user
 * If the user is not authenticated, it returns an error response instead of throwing
 * @param fn Function to execute with the authenticated user and admin client
 * @returns The result of the function or an error response
 */
export async function withAuth<T extends { status: number }>(
  fn: (userId: string) => Promise<T>
): Promise<T | AuthErrorResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.error("Authentication required: No user found in session");
      return {
        success: false,
        error: "Authentication required. Please sign in.",
        status: 401,
      };
    }

    return await fn(user.id);
  } catch (error) {
    console.error("Error in withAuth:", error);
    return {
      success: false,
      error: "Authentication error. Please try signing in again.",
      status: 500,
    };
  }
}
