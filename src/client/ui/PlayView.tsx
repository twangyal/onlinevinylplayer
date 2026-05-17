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
import { Music, ListMusic, Plus, X, Volume2, Volume1, VolumeX, Library } from "lucide-react";


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
            className={`item flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm transition-all ${isDragging ? 'shadow-lg scale-105 border-stone-400 dark:border-stone-600' : 'hover:border-stone-300 dark:hover:border-stone-700'}`} 
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
                className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors overflow-hidden min-w-0"
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
                    className="text-red-500/70 hover:text-red-500 transition-colors mx-2 flex-shrink-0"
                    title="Remove track"
                >
                    <X size={18} />
                </button>
            )}
            <button ref={handleRef} className="handle cursor-grab active:cursor-grabbing flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity" title="Drag to reorder" />
        </li>):
        (<li 
            ref={setElement} 
            className={`item-vinyl p-3 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800/50 shadow-sm transition-all ${isDragging ? 'scale-105 shadow-xl border-stone-400 dark:border-stone-600 z-10' : 'hover:-translate-y-1 hover:shadow-md'}`} 
            data-shadow={isDragging || undefined}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex flex-col items-center w-24 mx-auto aspect-square">
                <SpinningVinyl
                    title={dataId && (data[dataId] as Vinyl)?.name || 'Unknown Vinyl'}
                    tracks={dataId && (data[dataId] as Vinyl)?.tracks[1]! || []}
                    active={isHovering}
                    playing={false}
                />
                {dataId && (
                    <div className="w-full mt-3 overflow-hidden h-5">
                        <span 
                            className="marquee"
                            style={{ display: isHovering ? 'block' : 'none' }}
                        >
                            <span 
                                className="marquee-text text-xs font-semibold text-stone-800 dark:text-stone-200 whitespace-nowrap inline-block" 
                                style={{
                                    animation: isHovering ? 'marquee 4s linear infinite' : 'none'
                                }}
                            >
                                {(data[dataId] as Vinyl)?.name || 'Unknown Vinyl'}
                            </span>
                        </span>
                        <span 
                            className="text-xs block text-center font-semibold text-stone-800 dark:text-stone-200 truncate"
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
    const { isPlaying, currentId, queue, vinylLibrary, volume,
        togglePlay, addToQueue, moveInQueue, removeFromQueue, 
        loadVinylLibrary, addVinylToLibrary, playFromPoint, getProgress, changeVolume } 
        = useVinylPlayer(audioEngine, newVinylCallback, onNoMoreVinylsCallback);
    
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
        console.log("PauseOrPlay called with play =", play);
        if (play === undefined) {
            togglePlay();
        } else {
            if (play !== isPlaying) {
                togglePlay();
            }
        }
    };

    const [isSwitching, setIsSwitching] = useState(false);

    function newVinylCallback(): void {
        setIsSwitching(true);
        console.log("Current id", !!currentId)
        setTimeout(() => setIsSwitching(false), 150);
    }

    function onNoMoreVinylsCallback(): void {
        console.log("No more vinyls to play.");
        console.log("Current id", !!currentId)
        togglePlay();
    }

    return (
        <div className="relative w-full h-screen bg-stone-50 dark:bg-stone-950 text-stone-950 dark:text-stone-50 flex flex-col lg:flex-row overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
            
            {/* Vinyl Player Section */}
            <div className="w-full lg:w-1/2 lg:h-screen lg:overflow-y-auto p-4 lg:p-8 flex flex-col lg:flex-col gap-8 z-10">
                <div className="relative w-full max-w-[min(100%,67vh)] lg:max-w-[min(100%,67vh)] mx-auto rounded-3xl flex-shrink-0 bg-white/30 dark:bg-stone-900/30 backdrop-blur-3xl shadow-2xl border border-stone-200/50 dark:border-stone-800/50 p-6">
                    <VinylPlayer 
                        title={currentId ? vinylLibrary[currentId]?.name : "No Vinyl Playing"} 
                        tracks={currentId ? vinylLibrary[currentId]?.tracks[1] : []} 
                        handleClick={handleVinylClick} 
                        active={!!currentId} 
                        playing={isPlaying} 
                        setPlaying={pauseOrPlay}
                        getProgress={getProgress}
                        isSwitching={isSwitching}
                    />

                    {/* Volume Control Section */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-6 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-700/50 rounded-full shadow-xl p-3 flex flex-col items-center gap-4 w-12 z-20 transition-transform hover:scale-105">
                        <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
                            {Math.round(volume * 100)}
                        </span>
                        <div className="h-32 flex items-center justify-center">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                                className="h-1.5 w-28 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-white -rotate-90"
                            />
                        </div>
                        <span className="text-stone-700 dark:text-stone-300">
                            {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                        </span>
                    </div>
                </div>

                {/* Queue Section */}
                <div className="rounded-3xl shadow-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-md p-6 flex flex-col min-h-0 flex-1">
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 flex-shrink-0 mb-4">
                        <ListMusic size={24} className="text-amber-500" /> Queue
                    </h3>
                    <DragDropProvider onDragEnd={(event) => {
                            moveInQueue(event);
                        }}>
                        <ul className="list-vinyl overflow-x-auto pr-2 pb-4 pt-2 -my-2 flex-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
                            {queue.length === 0 ? (
                                <li className="text-center text-stone-500 dark:text-stone-400 py-10 w-full font-medium">Your queue is empty</li>
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
            <div className="w-full lg:w-1/2 lg:h-screen lg:overflow-y-auto p-4 lg:p-8 flex flex-col gap-8 z-10">
                <div className="rounded-3xl shadow-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-md p-6 flex flex-col min-h-0 flex-1">
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2 flex-shrink-0">
                        <Library size={24} className="text-orange-500" /> Vinyl Library
                    </h3>
                    
                    {Object.values(vinyls).length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="text-center p-8 rounded-2xl bg-white/40 dark:bg-stone-800/40 border border-dashed border-stone-300 dark:border-stone-700 w-full">
                                <Music size={40} className="mx-auto text-stone-400 dark:text-stone-500 mb-3" />
                                <p className="text-stone-600 dark:text-stone-400 font-medium">Your library is empty</p>
                                <p className="text-stone-500 dark:text-stone-500 text-sm mt-1">Create your first vinyl record to get started</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-3 overflow-y-auto flex-1 mb-6 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 pr-2">
                            {Object.values(vinyls).map((vinyl, index) => (
                                <li 
                                    key={vinyl.id} 
                                    className="p-4 bg-white/80 dark:bg-stone-800/80 rounded-2xl hover:shadow-lg cursor-pointer transition-all duration-300 border border-stone-200 dark:border-stone-700/50 hover:border-amber-400 dark:hover:border-amber-500 flex justify-between items-center group backdrop-blur-sm" 
                                    onClick={() => addToQueue(vinyl.id)}
                                >
                                    <div>
                                        <p className="text-stone-900 dark:text-white font-bold text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{vinyl.name}</p>
                                        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{vinyl.numberOfTracks} track{vinyl.numberOfTracks !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={20} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <button 
                        className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black font-semibold py-4 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex-shrink-0"
                        onClick={() => setActiveSection('upload')}
                    >
                        <Plus size={20} /> Create Vinyl
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {activeSection === 'upload' && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-50 dark:bg-stone-900 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 flex-shrink-0 z-10">
                            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-amber-500" /> Create Vinyl
                            </h2>
                            <button 
                                onClick={() => setActiveSection('home')}
                                className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors flex-shrink-0"
                                aria-label="Close"
                            >
                                <X size={20} />
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
                                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Vinyl Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl p-4 mb-6 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-900 dark:text-white shadow-sm"
                                    placeholder="Add a name for your vinyl"
                                    value={vinylName}
                                    onChange={(e) => setVinylName(e.target.value)}
                                />

                                {/* Tracks List */}
                                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Tracks ({fileOrder.length})</label>
                                <ul className="space-y-2 mb-6 border-2 border-stone-200 dark:border-stone-800 rounded-xl p-3 max-h-60 overflow-y-auto bg-white/50 dark:bg-stone-950/50">
                                    {fileOrder.length === 0 ? (
                                        <li className="text-center text-stone-500 dark:text-stone-400 py-8 font-medium">No tracks added yet</li>
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
                                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-bold py-4 px-4 rounded-xl mb-6 transition-all duration-200"
                                    onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
                                >
                                    <Plus size={20} /> Add Audio File
                                </button>
                            </DragDropProvider>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex-shrink-0 mt-auto">
                                <button 
                                    className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-3.5 px-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md" 
                                    onClick={() => { handleSubmit(); setActiveSection('home'); }}
                                >
                                    Create
                                </button>
                                <button 
                                    className="flex-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
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