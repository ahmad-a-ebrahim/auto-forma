import { supabase } from "@/lib/supabaseClient";

export async function uploadProfileImage(userId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `user-${userId}/${crypto.randomUUID()}.${ext}`;

  // Upload
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || `image/${ext}`,
    });

  if (error) throw error;

  // Get public URL (public bucket)
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
