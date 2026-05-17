"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/src/db/client";
import { saveVinylAction } from "@/src/app/(app)/add-vinyl/actions";
import { uploadAudio } from "@/src/lib/upload";
import { Music, UploadCloud, Loader2, Type, DiscAlbum } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddVinylForm({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);
    const [fileCount, setFileCount] = useState(0);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        
        // Get files from the form
        const formData = new FormData(e.currentTarget);
        const audioFiles = formData.getAll("tracks") as File[];
        
        // Upload files to Storage first
        const trackUrls = await Promise.all(
            audioFiles.map(file => uploadAudio(file, userId))
        );

        const tracks = trackUrls.map(url => ({ audio: url, gain: 1 }));
        const metadata = audioFiles.map(file => ({ name: file.name }));

        await saveVinylAction({
            name: formData.get("vinylName") as string,
            tracks: [tracks, metadata],
            numberOfTracks: trackUrls.length,
            currentTrackIndex: 0
        });
        
        setLoading(false);
        router.push('/collection');
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFileCount(e.target.files.length);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="vinylName" className="block text-sm font-bold text-stone-700 dark:text-stone-300">
                    Record Title
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <Type size={18} />
                    </div>
                    <input 
                        id="vinylName"
                        name="vinylName" 
                        placeholder="Add a name for your record" 
                        required 
                        className="w-full bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-900 dark:text-white shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300">
                    Audio Tracks
                </label>
                <div className="relative w-full">
                    <input 
                        type="file" 
                        id="tracks"
                        name="tracks" 
                        multiple 
                        accept="audio/*" 
                        required 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors ${fileCount > 0 ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/50 hover:border-amber-400 dark:hover:border-amber-600'}`}>
                        {fileCount > 0 ? (
                            <>
                                <Music className="text-amber-500 mb-3" size={32} />
                                <p className="text-stone-900 dark:text-white font-bold text-lg">{fileCount} {fileCount === 1 ? 'track' : 'tracks'} selected</p>
                                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Click or drag to change files</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="text-stone-400 dark:text-stone-500 mb-3" size={32} />
                                <p className="text-stone-700 dark:text-stone-300 font-bold">Click to upload or drag and drop</p>
                                <p className="text-stone-500 dark:text-stone-500 text-sm mt-1">WAV, MP3, or FLAC formats</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-4 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Pressing Record...
                        </>
                    ) : (
                        <>
                            <DiscAlbum size={20} />
                            Save Vinyl Record
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
