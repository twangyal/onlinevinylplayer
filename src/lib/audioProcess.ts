export async function getAudioBuffer(url: string, audioContext: AudioContext, signal?: AbortSignal): Promise<AudioBuffer> {
    const response = await fetch(url, { signal });
    
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
    console.log(`Fetched audio from ${url}, status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    
    if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
    }
    return await audioContext.decodeAudioData(arrayBuffer);
}