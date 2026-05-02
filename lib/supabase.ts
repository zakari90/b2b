import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
// Note: These need to be added to your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility function to upload an image to Supabase Storage
 * @param file The File object to upload
 * @param bucket The name of the Supabase bucket (default: "product-images")
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, bucket = "product-images"): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are missing. Please add them to your .env file.");
  }

  // Create a unique file name to prevent overwriting
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase Upload Error:", error.message);
    throw new Error(error.message);
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
