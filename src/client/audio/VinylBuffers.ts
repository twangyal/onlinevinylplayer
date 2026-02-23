import { getAudioBuffer } from "@/src/lib/audioProcess";
import { Vinyl } from "@/src/model/Vinyl";
import { Track } from "@/src/model/Track";
import { AudioEngine } from "./AudioEngine";

export class VinylBuffers {
    buffers : AudioBuffer[] = [];
    tracks : Track[] = [];
    engine : AudioEngine;

    constructor(engine: AudioEngine) {
        this.engine = engine;
    }

    addVinylToBuffer = (vinyl: Vinyl) => {
        this.tracks.push(...vinyl.tracks[0]);
    }

    loadSingleTrack = async (audioUrl: string) => {
        try {
            const audio = await getAudioBuffer(audioUrl, this.engine.context);
            return(audio);
        } catch (error) {
            console.error("Buffer loading failed:", error);
        }
    }

    loadAllTracks = async ({ signal }: { signal?: AbortSignal }) => {
        try {
            // Load all URLs in batches of 3 to avoid spikes in cpu which was causing the UI to freeze slightly
            const loadedBuffers: AudioBuffer[] = [];
            for (let i = 0; i < this.tracks.length; i += 3) {
                if (signal?.aborted) {
                    throw new DOMException("Aborted", "AbortError");
                }
                const batch = this.tracks.slice(i, i + 3);
                const batchBuffers = await Promise.all(
                    batch.map(track => getAudioBuffer(track.audioUrl, this.engine.context, signal))
                );
                loadedBuffers.push(...batchBuffers);
            }
            if (!signal?.aborted) {
                this.buffers = loadedBuffers;
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log("Load aborted successfully.");
            } else {
                console.error("Buffer loading failed:", error);
            }
        } finally {
            if (!signal?.aborted) {
                console.log("Finished loading all tracks.");
            }
        }
    };

    clearBuffers = () => {
        this.buffers = [];
        this.tracks = [];
    };
}