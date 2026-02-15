import type { Vinyl } from "./Vinyl";

export type VinylRepository = {
    listForUser(userId: string): Promise<Vinyl[]>;
    getWithTracks(id: string, userId: string): Promise<Vinyl>;
}