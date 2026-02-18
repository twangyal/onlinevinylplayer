import { useEffect, useRef } from 'react';
import { AudioEngine } from '@/src/client/audio/AudioEngine';

let audioEngineInstance: AudioEngine | null = null;

function getAudioEngine(): AudioEngine {
    if (!audioEngineInstance) {
        audioEngineInstance = new AudioEngine();
    }
    return audioEngineInstance;
}

export function useAudioEngine(): AudioEngine {
    const engineRef = useRef<AudioEngine | null>(null);

    useEffect(() => {
        engineRef.current = getAudioEngine();
    }, []);

    return engineRef.current!;
}