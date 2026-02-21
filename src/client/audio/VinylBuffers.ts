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
            // Load all URLs in parallel
            const loadedBuffers = await Promise.all(
                this.tracks.map(track => getAudioBuffer(track.audioUrl, this.engine.context, signal))
            );
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
                // Optionally clear track URLs after loading to free memory
                this.tracks.forEach(track => track.audioUrl = "");
            }
        }
    };

    clearBuffers = () => {
        this.buffers = [];
        this.tracks = [];
    };
}