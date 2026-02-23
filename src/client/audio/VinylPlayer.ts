import { currentTrack, type Vinyl, nextTrack, prevTrack } from "@/src/model/Vinyl";
import { AudioEngine } from "./AudioEngine";
import { TrackNode } from "./TrackNode";
import { VinylBuffers } from "@/src/client/audio/VinylBuffers";
import { QueueItem } from "@/src/model/Queue";
import { move } from '@dnd-kit/helpers';

export class VinylPlayer {
    // startFrom : number = 0;
    // pausedAt : number = 0;
    // offset : number = 0;
    paused : boolean = false;
    start : boolean = true;
    loading : boolean = false;

    vinylLibrary : Record<string, Vinyl> = {};
    vinylQueue : QueueItem[] = [];
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

    playNextTrack(skip:boolean=true, newVinylCallback: () => void = () => {}) {
        // stop current track
        this.engine.stop();
        while(true){
        // if no current vinyl, grab one
            if(this.currentVinylId == ""){ 
                // if no more vinyls, stop
                if(!this.dequeue()) {this.start=true;return;}
                newVinylCallback();
                skip = false;
            }
            // if its not just starting, skip to next track
            if(skip) {this.vinylLibrary[this.currentVinylId] = nextTrack(this.vinylLibrary[this.currentVinylId])};
            const track = currentTrack(this.vinylLibrary[this.currentVinylId]);
            // if no more tracks, try next vinyl
            if(!track) {this.pastVinyls.push(this.vinylLibrary[this.currentVinylId]);this.currentVinylId=""; continue;}

            this.engine.connect(new TrackNode(this.engine.context, track), () => {if(!this.paused)this.playNextTrack(true, newVinylCallback)});
            this.engine.play();
            break;
        }
        return;
    }
    
    pauseAndPlayTrack(newVinylCallback: () => void = () => {}):boolean{
        if(this.currentVinylId === "" && this.vinylQueue.length === 0) return false;
        if(this.paused){ 
            this.paused = false
            this.engine.play();
        } else{
            if(this.start){
                this.dequeue();
                this.playNextTrack(false, newVinylCallback);
                this.start = false;
            }
            else{
                console.log("Pausing track at current position.");
                this.engine.pause();
                this.paused = true;
            }
        }
        return true;
    }

    getQueue() {
        return [...this.vinylQueue];
    }
    
    setQueue(newQueue: QueueItem[]) {
        this.vinylQueue = newQueue;
    }

    moveInQueue(event: any) {
        const firstItem = this.vinylQueue[0];
        this.setQueue(move(this.vinylQueue.map(item => item.entryId), event).map(id => this.vinylQueue.find(item => item.entryId === id)!));
        if (firstItem && this.vinylQueue[0] && firstItem.entryId !== this.vinylQueue[0].entryId) {
            this.firstInQueue(firstItem.dataId, this.vinylQueue[0].dataId);

        }   
    }

    addToQueue(id: string){
        this.vinylQueue.push({entryId: crypto.randomUUID(), dataId: id});
        if(this.vinylQueue.length === 1) this.firstInQueue("", id);
    }

    removeFromQueue(index: number){
        if(index < 0 || index >= this.vinylQueue.length) return;
        const removed = this.vinylQueue.splice(index, 1)[0];
        if(this.vinylQueue[0] && index === 0){
            this.firstInQueue(removed.dataId, this.vinylQueue[0].dataId);
        }
    }

    dequeue(): boolean {
        if(this.vinylQueue.length <= 0 || !this.vinylQueue[0]) return false;
        this.currentVinylId = this.vinylQueue.shift()!.dataId;
        this.calculateCurrentTotalDuration();
        if(this.vinylQueue[0]) this.firstInQueue("", this.vinylQueue[0].dataId);
        return true;
    }

    clearQueue(){
        this.vinylQueue = [];
    }

    cleanupUnusedBuffers(keepIds: string[]) {
        if (keepIds.length === 0) return;
        Object.keys(this.vinylLibrary).forEach(id => {
            if (!keepIds.includes(id)) {
                this.vinylLibrary[id].tracks[0].forEach(t => {
                    t.audioBuffer = null;
                });
            }
        });
    }

    firstInQueue = async (oldVinylId: string, newVinylId: string) => {
        // Clear the old memory
        this.cleanupUnusedBuffers([newVinylId, this.currentVinylId]);
        
        this.abortControllerRef.current?.abort(); // Cancel any ongoing load
        const controller = new AbortController();
        this.abortControllerRef.current = controller;

        try {
            console.log("Loading new vinyl:", newVinylId);
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
                console.log("Finished loading vinyl:", newVinylId);
                this.setTrackDurations(newVinylId);
            }
            this.loading = false;
            this.VB.clearBuffers();
        }
    };

    setTrackDurations(vinylId: string) {
        if (!this.vinylLibrary[vinylId]) return;
        const vinyl = this.vinylLibrary[vinylId];
        vinyl.tracks[0].forEach((track, index) => {
            if (track.audioBuffer) {
                vinyl.tracks[1][index].duration = track.audioBuffer.duration;
            }
        });
    }

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
                console.log(`Playing from ${percent}% (offset: ${point.toFixed(2)}s) of current vinyl with duration ${this.currentVinylDuration.toFixed(2)}s.`);
                this.engine.connect(trackNode, () => {if(!this.paused)this.playNextTrack()});
                if(!this.paused) {
                    this.engine.play();
                }
                break;
            } else {
                point -= track.audioBuffer.duration;
            }
        }
    }
}

