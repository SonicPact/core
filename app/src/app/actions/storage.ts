"use server";

import { storageService } from "@/services/storageService";
import { getAuthenticatedWallet } from "./auth";

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to upload to
 * @param folder The folder within the bucket
 * @returns The URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string = "profiles",
  folder: string = "images"
): Promise<string | null> {
  // Verify that the user is authenticated
  const walletAddress = await getAuthenticatedWallet();

  if (!walletAddress) {
    throw new Error("Unauthorized: Authentication required");
  }

  try {
    return await storageService.uploadFile(file, bucket, folder);
  } catch (error) {
    console.error("Error in uploadFile server action:", error);
    return null;
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files The files to upload
 * @param bucket The storage bucket to upload to
 * @param folder The folder within the bucket
 * @returns An array of URLs for the uploaded files
 */
export async function uploadFiles(
  files: File[],
  bucket: string = "profiles",
  folder: string = "images"
): Promise<(string | null)[]> {
  // Verify that the user is authenticated
  const walletAddress = await getAuthenticatedWallet();

  if (!walletAddress) {
    throw new Error("Unauthorized: Authentication required");
  }

  try {
    return await storageService.uploadFiles(files, bucket, folder);
  } catch (error) {
    console.error("Error in uploadFiles server action:", error);
    return [];
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path The path of the file to delete
 * @param bucket The storage bucket containing the file
 * @returns Whether the deletion was successful
 */
export async function deleteFile(
  path: string,
  bucket: string = "profiles"
): Promise<boolean> {
  // Verify that the user is authenticated
  const walletAddress = await getAuthenticatedWallet();

  if (!walletAddress) {
    throw new Error("Unauthorized: Authentication required");
  }

  try {
    return await storageService.deleteFile(path, bucket);
  } catch (error) {
    console.error("Error in deleteFile server action:", error);
    return false;
  }
}
