// src/hooks/useVinylPlayer.ts
import { useState, useMemo, useCallback } from "react";
import { VinylPlayer,  } from "../audio/VinylPlayer";
import { AudioEngine } from "../audio/AudioEngine";
import { Vinyl } from "@/src/model/Vinyl";
import { QueueItem } from "@/src/model/Queue";

export function useVinylPlayer(engine: AudioEngine, newVinylCallback: () => void, onNoMoreVinyls?: () => void) {
    const player = useMemo(() => new VinylPlayer(engine, newVinylCallback, onNoMoreVinyls), [engine]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentId, setCurrentId] = useState("");
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [vinylLibrary, setVinylLibrary] = useState<Record<string, Vinyl>>({});
    const [volume, setVolume] = useState(1);

    const togglePlay = () => {
        if(player.pauseAndPlayTrack()) {
            setCurrentId(player.currentVinylId);
            console.log("current id is ", currentId)
            setQueue([...player.vinylQueue]);
            setVinylLibrary({...player.vinylLibrary});
            setIsPlaying(!player.paused);
        } else {
            setIsPlaying(false);
        }
    }

    const moveInQueue = (event: any) => {
        player.moveInQueue(event);
        setQueue(player.vinylQueue);
        setVinylLibrary({...player.vinylLibrary});
    }

    const removeFromQueue = (index: number) => {
        player.removeFromQueue(index);
        setQueue([...player.vinylQueue]);
        setVinylLibrary({...player.vinylLibrary});
    };

    const addToQueue = (id: string) => {
        player.addToQueue(id);
        setQueue([...player.vinylQueue]);
        setVinylLibrary({...player.vinylLibrary});
    };

    const loadVinylLibrary = () => {
        player.loadVinylLibrary();
        setVinylLibrary({...player.vinylLibrary});
    };

    const addVinylToLibrary = (vinyl: any) => {
        player.addVinylToLibrary(vinyl);
        setVinylLibrary({...player.vinylLibrary});
    };

    const playFromPoint = (percentage: number) => {
        player.playFromPoint(percentage);
    };

    const getProgress = useCallback(() => {
        if(player.currentVinylId) {
            return player.getCurrentProgress();
        }
        return 0;
    }, [player]);

    const changeVolume = (volume: number) => {
        player.setVolume(volume);
        setVolume(volume);
    };

    return {
        isPlaying,
        currentId,
        queue,
        vinylLibrary,
        volume,
        togglePlay,
        addToQueue,
        moveInQueue,
        removeFromQueue,
        loadVinylLibrary,
        addVinylToLibrary,
        playFromPoint,
        getProgress,
        changeVolume,
    };
}