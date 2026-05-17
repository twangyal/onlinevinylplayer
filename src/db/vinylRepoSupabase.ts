import { Vinyl } from "../model/Vinyl";
import type { VinylRepository } from "../model/VinylRepository";
import { createSupabaseServerClient } from "./serverClient";


export const vinylRepositorySupabase: VinylRepository = {
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
        name: row.title,
        tracks: [[],[]],
        numberOfTracks: data.length,
        currentTrackIndex: 0,
        } as Vinyl));
    },
    // Vinyl tracks
    async getTracks(id: string, userId: string) {
        const supabase = await createSupabaseServerClient();
    
        const { data, error } = await supabase
            .from("Vinyls")
            .select(`
                id,
                title,
                Vinyl_songs (
                    position,
                    Songs (
                        id,
                        title,
                        audio_url
                    )
                )
            `)
            .eq("id", id)
            .eq("user_id", userId)
            .order("position", { referencedTable: 'Vinyl_songs', ascending: true })
            .maybeSingle();
    
        if (error) throw error;
        if (!data) throw new Error("Vinyl not found");
    
        // Use optional chaining (?.) to prevent crashes if data is missing
        const tracks = data.Vinyl_songs
            ?.map((entry: any) => entry.Songs?.audio_url)
            .filter(Boolean) || [];
        
        const metadata = data.Vinyl_songs
            ?.map((entry:any) => entry.Songs?.title)
            .filter(Boolean) || [];
    
        return {
            id: data.id,
            name: data.title,
            tracks: [
                tracks.map((url: string) => ({ audioUrl: url, audioBuffer: null, gain: 1 })),
                metadata.map((meta: string) => ({name: meta, fade: 0, length: 0}))
            ],
            numberOfTracks: tracks.length,
            currentTrackIndex: 0
        } as Vinyl;
    },
    // Create Vinyl
    async addVinyl(vinyl: Vinyl, userId): Promise<Vinyl> {
        const supabase = await createSupabaseServerClient();
        
        const { data: vinylData, error: vinylError } = await supabase
            .from("Vinyls")
            .insert({ title: vinyl.name, user_id: userId })
            .select()
            .single();
    
        if (vinylError) throw vinylError;
        

        const songsToInsert = vinyl.tracks[1].map((meta, index) => ({
            title: meta.name,
            audio_url: vinyl.tracks[0][index].audioUrl,
            user_id: userId
        }));

        const { data: songData, error: songError } = await supabase
        .from("Songs")
        .insert(songsToInsert)
        .select();

        if (songError) throw songError

        const junctionInsert = songData.map((song, index) => ({
            song_id: song.id,
            vinyl_id: vinylData.id,
            position: index+1
        }));

        const { data: junctionData, error: junctionError } = await supabase
        .from("Vinyl_songs")
        .insert(junctionInsert)
        .select();

        if (junctionError) throw junctionError
        return vinyl;
    }
};

