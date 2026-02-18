import { getSupabaseBrowserClient } from "@/src/db/client";

export async function uploadAudio(file: File, userId: string, bucket: string = "songs"): Promise<string> {
    const supabase = getSupabaseBrowserClient();

    // Create file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to the bucket
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
}