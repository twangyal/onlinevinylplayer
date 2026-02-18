import { currentTrack, type Vinyl, nextTrack, prevTrack } from "@/src/model/Vinyl";
import { AudioEngine } from "./AudioEngine";
import { TrackNode } from "./TrackNode";

export class VinylPlayer {
    // startFrom : number = 0;
    // pausedAt : number = 0;
    // offset : number = 0;
    vinylQueue : Vinyl[] = [];
    pastVinyls : Vinyl[] = [];
    currentRecord : Vinyl|null = null
    engine : AudioEngine;
    paused : boolean = false;
    start : boolean = true;



    constructor(engine:AudioEngine) {
        this.engine = engine;
    }

    playNextTrack(skip:boolean=true):boolean{
        // stop current track
        this.engine.stop();
        while(true){
        // if no current record, grab one
            if(this.currentRecord == null){ 
                const record = this.vinylQueue.shift();
                // if no more records, stop
                if(!record) {this.start=true;return true;}
                this.currentRecord = record;
                skip = false;
            }
            // if its not just starting, skip to next track
            if(skip) {this.currentRecord = nextTrack(this.currentRecord)};
            const track = currentTrack(this.currentRecord);
            // if no more tracks, try next record
            if(!track) {this.pastVinyls.push(this.currentRecord);console.log("INDEX",this.currentRecord.currentTrackIndex); this.currentRecord=null; continue;}

            this.engine.load(new TrackNode(this.engine.context, track), () => {if(!this.paused)this.playNextTrack()});
            this.engine.play();
            break;
        }
        return false;
    }
    playPrevTrack(){
        if(this.currentRecord == null){ 
            return;
        }
        if(this.currentRecord.currentTrackIndex == 0) {
            this.vinylQueue.unshift(this.currentRecord);
            const prevRecord = this.pastVinyls.pop();
            if(prevRecord) this.currentRecord = prevRecord;
        }
        this.currentRecord = prevTrack(this.currentRecord);
        this.playNextTrack(false);
    }
    pauseAndPlayTrack() {
        if(this.paused){ 
            this.paused = false
            this.engine.play();
        } else{
            if(this.start){
                this.playNextTrack(false)
                this.start = false;
            }
            else{
                this.engine.pause();
                this.paused = true;
            }
        }
    }
    addToQueue(record:Vinyl){
        this.vinylQueue.push(record);
    }
    clearQueue(){
        this.vinylQueue = [];
    }
}

