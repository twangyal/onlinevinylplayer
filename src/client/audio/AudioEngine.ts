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
    
    connect(track:TrackNode, onEnded?: () => void){
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
            this.currentTrack.play(0);
        }
    }

    pause(){
        if(this.currentTrack){
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