// src/db/entries.ts
import { createSupabaseServerClient } from "./serverClient";

export async function insertEntry(data: {
    userId: string;
    playlistId: string;
    trackId: string;
    // any other fields
    }) {
    const supabase = createSupabaseServerClient();

    const { data: rows, error } = await supabase
        .from("entries")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return rows;
}
