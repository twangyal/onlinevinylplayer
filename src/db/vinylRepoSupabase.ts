import { Vinyl } from "../model/Vinyl";
import type { VinylRepository } from "../model/VinylRepository";
import { createSupabaseServerClient } from "./serverClient";


export const playlistRepositorySupabase: VinylRepository = {
    // Vinyl Repo
    async listForUser(userId) {
        const supabase = await createSupabaseServerClient();
        const {data, error} = await supabase
        .from("Vinyls")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        if (error) throw error;

        return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        tracks: [[],[]],
        numberOfTracks: 0,
        currentTrackIndex: 0,
        }));
    },
    // Vinyl Repo along with tracks
    async getWithTracks(id,userId){
        const supabase = await createSupabaseServerClient();

        const { data: playlistRows, error: playlistError } = await supabase
        .from("Vinyls")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

        if (playlistError) throw playlistError;
        if (!playlistRows) throw new Error("Vinyl not found");

        const { data: trackRows, error: tracksError } = await supabase
        .from("playlist_entries")
        .select(
            `
            position,
            tracks (
            id,
            title,
            artist,
            audio_url,
            duration_seconds
            )
        `
        )
        .eq("playlist_id", id)
        .order("position", { ascending: true });

        if (tracksError) throw tracksError;

        const tracks =
        trackRows?.map((row: any) => ({
            id: row.tracks.id,
            title: row.tracks.title,
            artist: row.tracks.artist,
            audioUrl: row.tracks.audio_url,
            durationSeconds: row.tracks.duration_seconds,
            position: row.position,
        })) ?? [];

        return {
        id: playlistRows.id,
        name: playlistRows.name,
        tracks: [[],[]],
        numberOfTracks:0,
        currentTrackIndex:0
        } as Vinyl;
    },
};