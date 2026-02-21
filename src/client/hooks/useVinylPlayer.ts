// src/hooks/useVinylPlayer.ts
import { useState, useMemo } from "react";
import { VinylPlayer } from "../audio/VinylPlayer";
import { AudioEngine } from "../audio/AudioEngine";
import { Vinyl } from "@/src/model/Vinyl";


export function useVinylPlayer(engine: AudioEngine) {
    const player = useMemo(() => new VinylPlayer(engine), [engine]);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentId, setCurrentId] = useState("");
    const [queue, setQueue] = useState<string[]>([]);
    const [vinylLibrary, setVinylLibrary] = useState<Record<string, Vinyl>>({});

    const togglePlay = () => {
        player.pauseAndPlayTrack();
        setIsPlaying(!player.paused);
        if(player.currentVinylId) setCurrentId(player.currentVinylId);};

    const addToQueue = (id: string) => {
        player.addToQueue(id);
        setQueue([...player.vinylQueue]);
    };

    const loadVinylLibrary = () => {
        player.loadVinylLibrary();
        setVinylLibrary(player.vinylLibrary);
    };

    const addVinylToLibrary = (vinyl: any) => {
        player.addVinylToLibrary(vinyl);
        setVinylLibrary({...player.vinylLibrary});
    };

    return {
        isPlaying,
        currentId,
        queue,
        vinylLibrary,
        togglePlay,
        addToQueue,
        loadVinylLibrary,
        addVinylToLibrary
    };
}