"use client";

import { useRef, useState, useEffect } from "react";
import { useVinylBuffers } from "@/src/client/hooks/useVinylBuffers";
import { Vinyl } from "@/src/model/Vinyl";
import { useSortable } from "@dnd-kit/react/sortable";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import { SpinningVinyl } from "./Vinyl";


function Sortable({id, index, handleLocalUpload, audioFiles}: {id: string; index: number; handleLocalUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; audioFiles: Record<string, {id: string, file: File | null}>}) {
    const [element, setElement] = useState<Element | null>(null);
    const handleRef = useRef<HTMLButtonElement | null>(null);
    const {isDragging} = useSortable({id, index, element, handle: handleRef});

    return (
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
                {audioFiles[id]?.file?.name || 'Unknown Track ' + (index + 1)}
            </button>
            <button ref={handleRef} className="handle" />
        </li>
    );
}

export function PlayView({ initialData, isLoggedIn }: { initialData: any, isLoggedIn: boolean }) {
    const [order, setOrder] = useState<string[]>([]);
    const [audioFiles, setAudioFiles] = useState<Record<string, {id: string, file: File | null}>>({});
    const [vinyls, setVinyls] = useState<Vinyl[]>(initialData);
    const [numberOfTracks, setNumberOfTracks] = useState(0);
    const hasFileByIndexRef = useRef<boolean[]>([]);

    const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.currentTarget.dataset.index ?? -1);
        const file = Array.from(e.target.files || []);

        if (index >= 0) {
            const hadFile = hasFileByIndexRef.current[index] ?? false;
            const hasFileNow = file.length > 0;
            hasFileByIndexRef.current[index] = hasFileNow;

            if (!hadFile && hasFileNow) {
                setNumberOfTracks((count) => count + 1);
            }
        }

        if (index < numberOfTracks) {
            const existingId = order[index];
            if (!existingId) return;
            setAudioFiles((prev) => ({
                ...prev,
                [existingId]: {
                    id: existingId,
                    file: file[0] || null,
                },
            }));
        }
        else{
            if (file.length === 0) return;
            const id = crypto.randomUUID();
            setOrder((prev) => [...prev, id]);
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
        const localTracks = Object.values(audioFiles).filter(file => file.file !== null).map(file => ({
            audio: URL.createObjectURL(file.file as File),
            gain: 1,
        }));
        if (Object.keys(audioFiles).length === 0) return;
        const metadata = Object.values(audioFiles).filter(file => file.file !== null).map((file, index) => ({
            name: file.file?.name || `Track ${index + 1}`,
            length: 0,
            fade: 0
        }));
        
        setVinyls([...vinyls, {
            name: "Local Session",
            tracks: [localTracks, metadata],
            numberOfTracks: numberOfTracks,
            currentTrackIndex: 0
        } as Vinyl]);
        setNumberOfTracks(0);
        setAudioFiles({});
        setOrder([]);
    };

    return (
        <div className="space-y-8">
        {!isLoggedIn && (
        <div className="flex gap-20">
            <SpinningVinyl/>
            <div className="w-1/5 border border-gray-300 rounded-lg p-4 space-y-4">
                <DragDropProvider
                onDragEnd={(event) => {
                    setOrder(prev => move(prev, event));
                }}
                >
                <ul className="list">
                    {order.map((id, index) => (
                        <Sortable key={id} id={id} index={index} handleLocalUpload={handleLocalUpload} audioFiles={audioFiles} />
                    ))}
                </ul>
                <div>
                <input
                    data-index={numberOfTracks}
                    type="file"
                    accept="audio/*"
                    onChange={handleLocalUpload}
                    className="w-full"
                    style={{ display: 'none' }}
                />
                <button onClick={(e) => ((e.currentTarget.previousElementSibling as HTMLInputElement)?.click())}>
                    {'Select Audio File'}
                </button>
                </div>
                </DragDropProvider>
                <button onClick={() =>  handleSubmit()}>Submit</button>
            </div>
            <DragDropProvider
                onDragEnd={(event) => {
                    setOrder(prev => move(prev, event));
                }}
                >
                <ul className="list">
                    {order.map((id, index) => (
                        <Sortable key={id} id={id} index={index} handleLocalUpload={handleLocalUpload} audioFiles={audioFiles} />
                    ))}
                </ul>
                <div>
                <input
                    data-index={numberOfTracks}
                    type="file"
                    accept="audio/*"
                    onChange={handleLocalUpload}
                    className="w-full"
                    style={{ display: 'none' }}
                />
                </div>
                </DragDropProvider>
        </div>
        )}
        </div>
    );
}

