import type { Track } from "../model/Track";

export class TrackNode {
    context : AudioContext;
    track : Track;
    source : AudioBufferSourceNode|null = null;
    gainNode : GainNode;
    startFrom : number = 0;
    pausedAt : number = 0;
    offset : number = 0;
    onEnded? : () => void;

    constructor(context : AudioContext, track : Track) {
        this.context = context;
        this.track = track;
        this.gainNode = context.createGain();
        this.gainNode.gain.value = this.track.gain;
    }

    connect(dest: AudioNode){
        this.gainNode.connect(dest);
    }
    setOnEnded(callback: () => void) {
        this.onEnded = callback;
    }

    play(time: number){
        this.source = this.context.createBufferSource();
        this.source.buffer = this.track.buffer;
        this.source.connect(this.gainNode);
        this.startFrom = this.context.currentTime
        this.source.start(time, this.offset);
        this.source.onended = () => {
            this.source?.stop();
            this.source = null;
            if(this.offset>=this.track.buffer.duration){
                this.offset = 0;
            }
            if (this.onEnded) this.onEnded();
        };    
    }
    
    pause(time: number){
        if(this.source) this.source.stop(time);
        this.pausedAt = this.context.currentTime;
        this.offset += this.pausedAt - this.startFrom;
        this.source = null;
    }

    stop(){
        if(this.source) {
            try {
                this.source.onended = null; // prevent ghost callbacks
                this.source.stop();
            } catch (e) {
            }
            this.source.disconnect();
            this.source = null;
        }
    }
}