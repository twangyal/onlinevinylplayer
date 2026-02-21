"use client";

import { useRef, useState, useEffect } from "react";
import { Vinyl } from "@/src/model/Vinyl";
import { useSortable } from "@dnd-kit/react/sortable";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import { SpinningVinyl } from "./Vinyl";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { createVinyl } from "../factories/createVinyl";
import { useVinylPlayer } from "../hooks/useVinylPlayer";


function Sortable({id, index, handleLocalUpload, data, isFile}: {
    id: string; 
    index: number; 
    handleLocalUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    data: Record<string, {id: string, file: File}>|Record<string, Vinyl>;
    isFile: boolean;
    }) {
    const [element, setElement] = useState<Element | null>(null);
    const handleRef = useRef<HTMLButtonElement | null>(null);
    const {isDragging} = useSortable({id, index, element, handle: handleRef});

    return (
        <>
        {isFile ? (
        <li ref={setElement} className="item" data-shadow={isDragging || undefined}>
            <input
                data-index={index}
                type="file"
                accept="audio/*"
                onChange={handleLocalUpload}
                className="w-full"
                style={{ display: 'none' }}
            />
            <button onClick={(e) => ((e.currentTarget.previousElementSibling as HTMLInputElement)?.click())}>
                {(data[id] as {id: string, file: File})?.file?.name || 'Unknown Track ' + (index + 1)}
            </button>
            <button ref={handleRef} className="handle" />
        </li>):
        (<li ref={setElement} className="item" data-shadow={isDragging || undefined}>
            {(data[id] as Vinyl)?.name || 'Unknown Vinyl ' + (index + 1)}
            <button ref={handleRef} className="handle" />
        </li>)
        }
        </>
    );
}

export function PlayView({ initialData, isLoggedIn }: { initialData: any, isLoggedIn: boolean }) {
    const audioEngine = useAudioEngine();
    const { isPlaying, currentId, queue, vinylLibrary,
        togglePlay, addToQueue, loadVinylLibrary, addVinylToLibrary } = useVinylPlayer(audioEngine);
    
    const [fileOrder, setFileOrder] = useState<string[]>([]);
    const [audioFiles, setAudioFiles] = useState<Record<string, {id: string, file: File}>>({});
    const [numberOfTracks, setNumberOfTracks] = useState(0);
    const hasFileByIndexRef = useRef<boolean[]>([]);

    const [vinylName, setVinylName] = useState("");
    const [vinyls, setVinyls] = useState<Record<string, Vinyl>>({});



    const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.currentTarget.dataset.index ?? -1);
        const file = Array.from(e.target.files || []);

        // Check if the file presence has changed for this index and update the track count accordingly
        if (index >= 0) {
            const hadFile = hasFileByIndexRef.current[index] ?? false;
            const hasFileNow = file.length > 0;
            hasFileByIndexRef.current[index] = hasFileNow;

            if (!hadFile && hasFileNow) {
                setNumberOfTracks((count) => count + 1);
            }
        }
        // Update existing track
        if (index < numberOfTracks) {
            const existingId = fileOrder[index];
            if (!existingId) return;
            setAudioFiles((prev) => ({
                ...prev,
                [existingId]: {
                    id: existingId,
                    file: file[0] || null,
                },
            }));
        }
        // Add new track
        else{
            if (file.length === 0) return;
            const id = crypto.randomUUID();
            setFileOrder((prev) => [...prev, id]);
            setAudioFiles((prev) => ({
                ...prev,
                [id]: {
                    id,
                    file: file[0] || null,
                },
            }));
        }
    };

    const handleSubmit = () => {    
        // Create track objects with audio URLs and metadata to fit domains of Vinyl and Track models
        const localTracks = Object.values(audioFiles).filter(file => file.file !== null).map(file => ({
            audioUrl: URL.createObjectURL(file.file as File),
            audioBuffer: null,
            gain: 1,
        }));
        if (Object.keys(audioFiles).length === 0) return;
        const metadata = Object.values(audioFiles).filter(file => file.file !== null).map((file, index) => ({
            name: file.file?.name || `Track ${index + 1}`,
            length: 0,
            fade: 0
        }));
        
        if (localTracks.length === 0) return;

        const newVinyl = createVinyl(localTracks, metadata, vinylName || "Unnamed Vinyl "+ (1 + Object.keys(vinyls).length));
        setVinyls((prev) => ({
            ...prev,
            [newVinyl.id]: {
                ...newVinyl
            },
        }));
        addVinylToLibrary(newVinyl);
        setNumberOfTracks(0);
        setAudioFiles({});
        setFileOrder([]);
    };

    return (
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 bg-gray-200">
            <div className="bg-gray-400 aspect-square max-h-full">
                <SpinningVinyl/>
                <button onClick={() => {
                    togglePlay();
                }}>{isPlaying ? "Pause" : "Play"}</button>
            </div>

            <div className="grid grid-rows-[auto_1fr] gap-6">
            <div className="grid grid-cols-2 gap-6 h-140">
                <div className="bg-gray-500 max-h-full">
                    <ul className="list">
                        {Object.values(vinyls).map((vinyl, index) => (
                            <li key={vinyl.id} className="p-3 mb-2 bg-gray-600 rounded hover:bg-gray-700 cursor-pointer transition" onClick={() => addToQueue(vinyl.id)}>
                                <span className="text-white font-medium">{vinyl.name}</span>
                                <span className="text-gray-300 text-sm ml-2">({vinyl.numberOfTracks} tracks)</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-500 max-h-full" >
                <DragDropProvider
                    onDragEnd={(event) => {
                        setFileOrder((prev) => move(prev, event));
                    }}
                    >
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 mb-4"
                        placeholder="Enter Track Name"
                        value={vinylName}
                        onChange={(e) => setVinylName(e.target.value)}
                    />

                    <ul className="list max-h-96 overflow-y-auto pr-2">
                        {fileOrder.map((id, index) => (
                        <Sortable
                            key={id}
                            id={id}
                            index={index}
                            handleLocalUpload={handleLocalUpload}
                            data={audioFiles}
                            isFile={true}
                        />
                        ))}
                    </ul>
                    
                </DragDropProvider>
                <div className="mt-4">
                    <input
                    data-index={numberOfTracks}
                    type="file"
                    accept="audio/*"
                    onChange={handleLocalUpload}
                    className="w-full"
                    style={{ display: "none" }}
                    />
                    <button
                    className="w-full bg-blue-500 text-white p-2 rounded"
                    onClick={(e) =>
                        (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()
                    }
                    >
                    Add Audio File
                    </button>
                </div>
                <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={() =>  handleSubmit()}>Submit</button>
                </div>     
            </div>
            <div className="bg-gray-500 h-80">
                <DragDropProvider>
                    <ul>
                        {queue.map((id, index) => (
                        <Sortable
                            key={id}
                            id={id}
                            index={index}
                            data={vinylLibrary}
                            isFile={false}
                        />
                        ))}
                    </ul>
                </DragDropProvider>
            </div>
            </div>
        </div>
    );
}

