import type { Metadata } from "../model/Metadata";
import type { Track } from "../model/Track";
import type { Vinyl } from "../model/Vinyl";


export function createVinyl(tracks:Track[], meta:Metadata[]): Vinyl {
    console.log("Creating Vinyl")
    return {
        id: crypto.randomUUID(),
        tracks: [tracks, meta],
        numberOfTracks: tracks.length,
        currentTrackIndex:0
    }
}