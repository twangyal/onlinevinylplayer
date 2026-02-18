import type { Vinyl } from "@/src/model/Vinyl";
import { TrackNode } from "./TrackNode"

class AudioEngine {
    context: AudioContext;
    masterGain: GainNode;
    currentTrack : TrackNode|null;
    private playbackId : number = 0;

    constructor() {
        this.context = new AudioContext();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.currentTrack = null;
    }

    // Load an audio file and decode it into an AudioBuffer
    async loadAudio(file: File) : Promise<AudioBuffer> {
        const arraybuffer = await file.arrayBuffer();
        const audiobuffer = await this.context.decodeAudioData(arraybuffer);
        return audiobuffer;
    }
    
    load(track:TrackNode, onEnded?: () => void){
        this.playbackId++;
        const id = this.playbackId;
        if (this.currentTrack) {
            this.currentTrack.stop();
        }
        this.currentTrack = track;
        this.currentTrack.connect(this.masterGain);

        if (onEnded) {
            track.setOnEnded(() => {
                if(this.playbackId==id){
                    onEnded();
                }
            });
        }
    }

    play() {
        if(this.currentTrack){ 
            console.log("Playing")
            this.currentTrack.play(0);
        }
    }

    pause(){
        if(this.currentTrack){
            console.log("PAUSING")
            this.currentTrack.pause(0);
        }
    }

    stop(){
        if(this.currentTrack){
            this.currentTrack.stop();
            this.currentTrack = null;
        }
    }
}

export {AudioEngine}