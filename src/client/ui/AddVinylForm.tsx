"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/src/db/client";
import { saveVinylAction } from "@/src/app/(app)/add-vinyl/actions";
import { uploadAudio } from "@/src/lib/upload";

export function AddVinylForm({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

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
    }

    return (
        <form onSubmit={handleSubmit}>
        <input name="vinylName" placeholder="Title" required />
        <input type="file" name="tracks" multiple accept="audio/*" required />
        <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Save Vinyl"}
        </button>
        </form>
    );
}