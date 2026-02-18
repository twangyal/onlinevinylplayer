// src/hooks/useVinylBuffers.ts
import { useState } from "react";
import { getAudioBuffer } from "@/src/lib/audioProcess";
import { useAudioEngine } from "./useAudioEngine";

export function useVinylBuffers(tracks: { audio: string }[]) {
    const [buffers, setBuffers] = useState<AudioBuffer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const audioEngine = useAudioEngine();

    const loadAllTracks = async () => {
        setIsLoading(true);
        try {
            // Load all URLs in parallel
            const loadedBuffers = await Promise.all(
                tracks.map(track => getAudioBuffer(track.audio, audioEngine.context))
            );
            
            setBuffers(loadedBuffers);
        } catch (error) {
            console.error("Buffer loading failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { buffers, loadAllTracks, isLoading };
}