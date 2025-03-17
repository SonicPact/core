import { createServerSupabaseClient } from "@/shared/utils/server-auth";
import { v4 as uuidv4 } from "uuid";

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   * @param file The file to upload
   * @param bucket The storage bucket to upload to
   * @param folder The folder within the bucket
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: File,
    bucket: string = "profiles",
    folder: string = "images"
  ): Promise<string | null> {
    try {
      const supabaseAdmin = await createServerSupabaseClient();

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload the file to Supabase Storage using admin client
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      // Get the public URL for the file
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadFile:", error);
      return null;
    }
  },

  /**
   * Upload multiple files to Supabase Storage
   * @param files The files to upload
   * @param bucket The storage bucket to upload to
   * @param folder The folder within the bucket
   * @returns An array of URLs for the uploaded files
   */
  async uploadFiles(
    files: File[],
    bucket: string = "profiles",
    folder: string = "images"
  ): Promise<(string | null)[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFile(file, bucket, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error in uploadFiles:", error);
      return [];
    }
  },

  /**
   * Delete a file from Supabase Storage
   * @param path The path of the file to delete
   * @param bucket The storage bucket containing the file
   * @returns Whether the deletion was successful
   */
  async deleteFile(
    path: string,
    bucket: string = "profiles"
  ): Promise<boolean> {
    try {
      const supabaseAdmin = await createServerSupabaseClient();
      const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

      if (error) {
        console.error("Error deleting file:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return false;
    }
  },
};
