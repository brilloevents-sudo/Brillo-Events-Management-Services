import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ncvohdlujhbekgaceuwv.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_iv4HNpvxoCRezCOoNnruuw_rARUntqc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Server-side Supabase client with Service Role privileges
 * Uses environment variable SUPABASE_SERVICE_ROLE_KEY configured on Vercel / .env
 */
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey) {
    return null;
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Uploads a photo or video buffer to the public `santa-gallery` bucket in Supabase Storage
 * Returns the permanent public CDN URL if successful, or null if service role key is not configured.
 */
export async function uploadToSupabaseGallery(
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const adminClient = getServiceSupabase();
  if (!adminClient) return null;
  try {
    const { error } = await adminClient.storage
      .from("santa-gallery")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });
    if (error) return null;
    const { data } = adminClient.storage.from("santa-gallery").getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}
