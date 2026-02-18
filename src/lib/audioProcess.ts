export async function getAudioBuffer(url: string, audioContext: AudioContext): Promise<AudioBuffer> {
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();

    return await audioContext.decodeAudioData(arrayBuffer);
}