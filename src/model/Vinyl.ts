import type { Track } from "./Track.ts"
import type { Metadata } from "./Metadata.ts"

export type Vinyl = {
    id? : string
    name : string
    tracks : [Track[], Metadata[]]
    numberOfTracks : number
    currentTrackIndex : number
}

export function nextTrack(vinyl: Vinyl): Vinyl {
    if (vinyl.currentTrackIndex < -1) return vinyl;
    return {
        ...vinyl,
        currentTrackIndex: vinyl.currentTrackIndex + 1,
    };
}
export function prevTrack(vinyl: Vinyl): Vinyl {
    if (vinyl.currentTrackIndex <= 0) return vinyl;
    return {
        ...vinyl,
        currentTrackIndex: vinyl.currentTrackIndex - 1,
    };
}

export function currentTrack(vinyl: Vinyl): Track | undefined {
    if (vinyl.currentTrackIndex < 0) return undefined;
    if (vinyl.currentTrackIndex  > vinyl.tracks[0].length) return undefined;
    return vinyl.tracks[0][vinyl.currentTrackIndex];
}

