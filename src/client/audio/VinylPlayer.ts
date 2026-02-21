import { currentTrack, type Vinyl, nextTrack, prevTrack } from "@/src/model/Vinyl";
import { AudioEngine } from "./AudioEngine";
import { TrackNode } from "./TrackNode";
import { VinylBuffers } from "@/src/client/audio/VinylBuffers";

export class VinylPlayer {
    // startFrom : number = 0;
    // pausedAt : number = 0;
    // offset : number = 0;
    paused : boolean = true;
    start : boolean = true;
    loading : boolean = false;

    vinylLibrary : Record<string, Vinyl> = {};
    vinylQueue : string[] = [];
    pastVinyls : Vinyl[] = [];
    currentVinylId : string = "";
    nextVinylId : string = "";
    currentVinylDuration : number = 0;

    engine : AudioEngine;
    VB : VinylBuffers;
    abortControllerRef = { current: null as AbortController | null };
    
    

    constructor(engine:AudioEngine) {
        this.engine = engine;
        this.VB = new VinylBuffers(engine);
    }

    addVinylToLibrary(vinyl: Vinyl) {
        const id = vinyl.id;
        this.vinylLibrary[id] = vinyl;
    }

    loadVinylLibrary() {
        this.vinylLibrary = {};
    }

    playNextTrack(skip:boolean=true):boolean{
        // stop current track
        this.engine.stop();
        while(true){
        // if no current vinyl, grab one
            if(this.currentVinylId == ""){ 
                const vinylId = this.vinylQueue.shift();
                // if no more vinyls, stop
                if(!vinylId) {this.start=true;return true;}
                this.currentVinylId = vinylId;
                skip = false;
            }
            // if its not just starting, skip to next track
            if(skip) {this.vinylLibrary[this.currentVinylId] = nextTrack(this.vinylLibrary[this.currentVinylId])};
            const track = currentTrack(this.vinylLibrary[this.currentVinylId]);
            // if no more tracks, try next vinyl
            if(!track) {this.pastVinyls.push(this.vinylLibrary[this.currentVinylId]);this.currentVinylId=""; continue;}

            this.engine.connect(new TrackNode(this.engine.context, track), () => {if(!this.paused)this.playNextTrack()});
            this.engine.play();
            break;
        }
        return false;
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

    getQueue() {
        return [...this.vinylQueue];
    }
    
    setQueue(newQueue: string[]) {
        this.vinylQueue = newQueue;
    }

    addToQueue(id: string){
        this.vinylQueue.push(id);
        if(this.vinylQueue.length === 1) this.firstInQueue("", id);
    }

    dequeue() {
        if(this.vinylQueue.length <= 0 || !this.vinylQueue[0]) return;
        this.currentVinylId = this.vinylQueue.shift()!;
        this.calculateCurrentTotalDuration();
        if(this.vinylQueue[0]) this.firstInQueue("", this.vinylQueue[0]);
    }

    clearQueue(){
        this.vinylQueue = [];
    }

    firstInQueue = async (oldVinylId: string, newVinylId: string) => {
        // Clear the old memory
        if (oldVinylId && this.vinylLibrary[oldVinylId]) {
            this.vinylLibrary[oldVinylId].tracks[0].forEach(t => t.audioBuffer = null);
        }
        
        this.abortControllerRef.current?.abort(); // Cancel any ongoing load
        const controller = new AbortController();
        this.abortControllerRef.current = controller;

        try {
            this.loading = true;
            this.VB.addVinylToBuffer(this.vinylLibrary[newVinylId]);
            await this.VB.loadAllTracks(
                { signal: controller.signal }
            );
            if (!controller.signal.aborted) {
                const newBuffers = this.VB.buffers; 
                newBuffers.forEach((buffer, index) => {
                    this.vinylLibrary[newVinylId].tracks[0][index].audioBuffer = buffer;
                });
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log("Old queue load cancelled - user moved on.");
            } else {
                console.error("Queue load failed", err);
            }
        } finally {
            if (!controller.signal.aborted) {
                this.abortControllerRef.current = null;
            }
            this.loading = false;
            this.VB.clearBuffers();
        }
    };

    calculateCurrentTotalDuration() {
        if (!this.currentVinylId || !this.vinylLibrary[this.currentVinylId]) return 0;

        const vinyl = this.vinylLibrary[this.currentVinylId];
        if (!vinyl.tracks[0] || vinyl.tracks[0].length === 0 || !vinyl.tracks[0][0].audioBuffer) return 0;
        let total = vinyl.tracks[0].reduce((total, track) => {
            return total + (track.audioBuffer ? track.audioBuffer.duration : 0);
        }, 0);
        this.currentVinylDuration = total;
    }

    playFromPoint(percent: number) {
        if (!this.currentVinylId || !this.vinylLibrary[this.currentVinylId]) return;
        let point = percent * this.currentVinylDuration;
        for (const track of this.vinylLibrary[this.currentVinylId].tracks[0]) {
            if (!track.audioBuffer) continue;
            if (point < track.audioBuffer.duration) {
                this.engine.stop();
                const trackNode = new TrackNode(this.engine.context, track);
                trackNode.offset = point;
                this.engine.connect(trackNode, () => {if(!this.paused)this.playNextTrack()});
                this.engine.play();
                break;
            } else {
                point -= track.audioBuffer.duration;
            }
        }
    }
}



    

    

//     const play = (vinylId: string) => {
//         if(currentVinylId === vinylId) return;
//     }

