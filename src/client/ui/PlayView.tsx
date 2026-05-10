"use client";

import { useRef, useState, useEffect } from "react";
import { Vinyl } from "@/src/model/Vinyl";
import { useSortable } from "@dnd-kit/react/sortable";
import {DragDropProvider} from '@dnd-kit/react';
import { move, arrayMove } from '@dnd-kit/helpers';
import { SpinningVinyl } from "./Vinyl";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { createVinyl } from "../factories/createVinyl";
import { useVinylPlayer } from "../hooks/useVinylPlayer";
import { QueueItem } from "@/src/model/Queue";
import { VinylPlayer } from "./VinylPlayer";


function Sortable({id, index, handleLocalUpload, data, isFile, dataId, onRemove}: {
    id: string; 
    index: number; 
    handleLocalUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    data: Record<string, {id: string, file: File}>|Record<string, Vinyl>;
    isFile: boolean;
    dataId?: string;
    onRemove?: (id: string, index: number) => void;
    }) {
    const [element, setElement] = useState<Element | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const handleRef = useRef<HTMLButtonElement | null>(null);
    const {isDragging} = useSortable({id, index, element, handle: handleRef});

    return (
        <>
        {isFile ? (
        <li 
            ref={setElement} 
            className="item" 
            data-shadow={isDragging || undefined}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <input
                data-index={index}
                type="file"
                accept="audio/*"
                onChange={handleLocalUpload}
                className="w-full"
                style={{ display: 'none' }}
            />
            <button 
                onClick={(e) => ((e.currentTarget.previousElementSibling as HTMLInputElement)?.click())}
                className="flex-1 text-left text-sm hover:text-blue-600 transition-colors overflow-hidden min-w-0"
                style={{ textOverflow: 'ellipsis' }}
            >
                <span 
                    className="marquee"
                    style={{ display: isHovering ? 'block' : 'none' }}
                >
                    <span 
                        className="marquee-text" 
                        style={{
                            animation: isHovering ? 'marquee 8s linear infinite' : 'none'
                        }}
                    >
                        {(data[id] as {id: string, file: File})?.file?.name || 'Unknown Track ' + (index + 1)}
                    </span>
                </span>
                <span 
                    style={{ display: isHovering ? 'none' : 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                    {(data[id] as {id: string, file: File})?.file?.name || 'Unknown Track ' + (index + 1)}
                </span>
            </button>
            {onRemove && (
                <button 
                    onClick={() => onRemove(id, index)} 
                    className="text-red-500 hover:text-red-700 mx-2 text-lg font-bold flex-shrink-0"
                    title="Remove track"
                >
                    ×
                </button>
            )}
            <button ref={handleRef} className="handle cursor-grab active:cursor-grabbing flex-shrink-0" title="Drag to reorder" />
        </li>):
        (<li 
            ref={setElement} 
            className="item-vinyl p-2 bg-gray-50 rounded-lg border border-gray-100" 
            data-shadow={isDragging || undefined}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex flex-col items-center w-18 mx-auto aspect-square">
                <SpinningVinyl
                    title={dataId && (data[dataId] as Vinyl)?.name || 'Unknown Vinyl'}
                    tracks={dataId && (data[dataId] as Vinyl)?.tracks[1]! || []}
                    active={false}
                    playing={false}
                />
                {dataId && (
                    <div className="w-full mt-2 overflow-hidden h-4">
                        <span 
                            className="marquee"
                            style={{ display: isHovering ? 'block' : 'none' }}
                        >
                            <span 
                                className="marquee-text text-xs font-medium text-gray-700 whitespace-nowrap inline-block" 
                                style={{
                                    animation: isHovering ? 'marquee 4s linear infinite' : 'none'
                                }}
                            >
                                {(data[dataId] as Vinyl)?.name || 'Unknown Vinyl'}
                            </span>
                        </span>
                        <span 
                            className="text-xs block text-center font-medium text-gray-700 truncate"
                            style={{ display: isHovering ? 'none' : 'block' }}
                        >
                            {(data[dataId] as Vinyl)?.name || 'Unknown Vinyl'}
                        </span>
                    </div>
                )}
            </div>
        </li>)
        }
        </>
    );
}

export function PlayView({ initialData, isLoggedIn }: { initialData: any, isLoggedIn: boolean }) {
    const audioEngine = useAudioEngine();
    const { isPlaying, currentId, queue, vinylLibrary,
        togglePlay, addToQueue, moveInQueue, removeFromQueue, 
        loadVinylLibrary, addVinylToLibrary, playFromPoint, getProgress } = useVinylPlayer(audioEngine);
    
    const [fileOrder, setFileOrder] = useState<QueueItem[]>([]);
    const [audioFiles, setAudioFiles] = useState<Record<string, {id: string, file: File}>>({});
    const [numberOfTracks, setNumberOfTracks] = useState(0);
    const hasFileByIndexRef = useRef<boolean[]>([]);

    const [vinylName, setVinylName] = useState("");
    const [vinyls, setVinyls] = useState<Record<string, Vinyl>>({});
    const [activeSection, setActiveSection] = useState('home');


    useEffect(() => {
        loadVinylLibrary();
    }, []);

    const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.currentTarget.dataset.index ?? -1);
        console.log("File input changed at index:", index);
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
            const existingId = fileOrder[index].dataId;
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
            setFileOrder((prev) => [...prev, {entryId: id, dataId: id}]);
            setAudioFiles((prev) => ({
                ...prev,
                [id]: {
                    id,
                    file: file[0] || null,
                },
            }));
        }
        if (index === numberOfTracks) {
            e.currentTarget.value = ""; // Clear the file input for the next upload
        }
    };

    const handleRemoveTrack = (idToRemove: string, indexToRemove: number) => {
        setFileOrder(prev => prev.filter(item => item.entryId !== idToRemove));
        setAudioFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[idToRemove];
            return newFiles;
        });
        
        if (hasFileByIndexRef.current[indexToRemove]) {
            setNumberOfTracks(count => count - 1);
        }
        hasFileByIndexRef.current.splice(indexToRemove, 1);
    };

    const handleSubmit = () => {    
        const orderedFiles = fileOrder
            .map(item => audioFiles[item.dataId!])
            .filter(fileObj => fileObj && fileObj.file !== null);

        if (orderedFiles.length === 0) return;

        // Create track objects with audio URLs and metadata to fit domains of Vinyl and Track models
        const localTracks = orderedFiles.map(file => ({
            audioUrl: URL.createObjectURL(file.file as File),
            audioBuffer: null,
            gain: 1,
        }));
        
        const metadata = orderedFiles.map((file, index) => ({
            name: file.file?.name || `Track ${index + 1}`,
            length: 0,
            fade: 0
        }));

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
        hasFileByIndexRef.current = [];
    };

    const handleVinylClick = (percentage: number) => {
        playFromPoint(percentage);
    };

    const pauseOrPlay = (play? : boolean) => {
        if (play === undefined) {
            togglePlay();
        } else {
            if (play !== isPlaying) {
                togglePlay();
            }
        }
    };

    return (
        <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row overflow-hidden">
            {/* Vinyl Player Section - Sticky on desktop, scrollable on mobile */}
            <div className="w-full lg:w-1/2 lg:h-screen lg:overflow-y-auto p-4 lg:p-8 flex flex-col lg:flex-col gap-8">
                <div className="w-full max-w-[min(100%,67vh)] lg:max-w-[min(100%,67vh)] mx-auto  rounded-2xl flex-shrink-0">
                    <VinylPlayer 
                    title={currentId ? vinylLibrary[currentId]?.name : "No Vinyl Playing"} 
                    tracks={currentId ? vinylLibrary[currentId]?.tracks[1] : []} 
                    handleClick={handleVinylClick} 
                    active={!!currentId} 
                    playing={isPlaying} 
                    setPlaying={pauseOrPlay}
                    getProgress={getProgress}
                    />
                </div>

                {/* Queue Section */}
                <div className="rounded-2xl shadow-md bg-white p-6 flex flex-col min-h-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-shrink-0 mb-1">
                        <span>🎵</span> Queue
                    </h3>
                    <DragDropProvider onDragEnd={(event) => {
                            moveInQueue(event);
                        }}>
                        <ul className="list-vinyl overflow-x-auto pr-2 py-4 -my-4 flex-1">
                            {queue.length === 0 ? (
                                <li className="text-center text-gray-400 py-8">No vinyls in queue</li>
                            ) : (
                                queue.map((id, index) => (
                                <Sortable
                                    key={id.entryId}
                                    id={id.entryId}
                                    dataId={id.dataId}
                                    index={index}
                                    data={vinyls}
                                    isFile={false}
                                />
                                ))
                            )}
                        </ul>
                    </DragDropProvider>
                </div>
            </div>

            {/* Right Panel - Library & Controls */}
            <div className="w-full lg:w-1/2 lg:h-screen lg:overflow-y-auto p-4 lg:p-8 flex flex-col gap-8">
                {/* Library Section with Create Button */}
                <div className="rounded-2xl shadow-md bg-white p-6 flex flex-col min-h-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 flex-shrink-0">
                        Vinyl Library
                    </h3>
                    
                    {Object.values(vinyls).length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-4">Create a new vinyl record</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-2 overflow-y-auto flex-1 mb-4">
                            {Object.values(vinyls).map((vinyl, index) => (
                                <li 
                                    key={vinyl.id} 
                                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200 border border-blue-100 hover:border-blue-300" 
                                    onClick={() => addToQueue(vinyl.id)}
                                >
                                    <p className="text-gray-900 font-semibold text-sm">{vinyl.name}</p>
                                    <p className="text-gray-500 text-xs mt-1">{vinyl.numberOfTracks} tracks</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <button 
                        className="w-full bg-gradient-to-r bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:bg-gray-700 transition-all duration-200 flex-shrink-0"
                        onClick={() => setActiveSection('upload')}
                    >
                        + Create Vinyl
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {activeSection === 'upload' && (
                <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r to-black-500 from-gray-900 px-6 py-6 flex items-center justify-between rounded-t-2xl flex-shrink-0">
                            <h2 className="text-xl font-family-mono font-semibold text-white">Create Vinyl</h2>
                            <button 
                                onClick={() => setActiveSection('home')}
                                className="text-white text-2xl hover:opacity-80 transition flex-shrink-0 ml-4"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                            <DragDropProvider
                                onDragEnd={(event) => {
                                    const newFileOrderObjects = move(fileOrder.map(item => item.entryId), event).map(id => fileOrder.find(item => item.entryId === id)!);
                                    setFileOrder(newFileOrderObjects);
                                }}
                            >
                                {/* Vinyl Name Input */}
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Vinyl Name</label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-200 rounded-lg p-3 mb-6 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    placeholder="Add a name for your vinyl"
                                    value={vinylName}
                                    onChange={(e) => setVinylName(e.target.value)}
                                />

                                {/* Tracks List */}
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tracks ({fileOrder.length})</label>
                                <ul className="space-y-2 mb-6 border-2 border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                                    {fileOrder.length === 0 ? (
                                        <li className="text-center text-gray-400 py-4">No tracks added yet</li>
                                    ) : (
                                        fileOrder.map((id, index) => (
                                            <Sortable
                                                key={id.entryId}
                                                id={id.entryId}
                                                index={index}
                                                handleLocalUpload={handleLocalUpload}
                                                data={audioFiles}
                                                isFile={true}
                                                onRemove={handleRemoveTrack}
                                            />
                                        ))
                                    )}
                                </ul>
                                    
                                {/* Add Track Button */}
                                <input
                                    data-index={numberOfTracks}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleLocalUpload}
                                    style={{ display: "none" }}
                                />
                                <button
                                    className="w-full to-black-500 from-gray-900 bg-gradient-to-r hover:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg mb-4 transition-colors duration-200"
                                    onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
                                >
                                    + Add Audio File
                                </button>
                            </DragDropProvider>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
                                <button 
                                    className="flex-1 to-black-500 from-gray-900 bg-gradient-to-r hover:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200" 
                                    onClick={() => { handleSubmit(); setActiveSection('home'); }}
                                >
                                    Create
                                </button>
                                <button 
                                    className="flex-1 to-black-500 from-gray-900 bg-gradient-to-r hover:bg-red-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                    onClick={() => setActiveSection('home')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
