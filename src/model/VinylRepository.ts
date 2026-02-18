import type { Vinyl } from "./Vinyl";

export type VinylRepository = {
    listForUser(userId: string): Promise<Vinyl[]>;
    getTracks(id: string, userId: string): Promise<Vinyl>;
    addVinyl(vinyl: Vinyl, user_Id: string): Promise<Vinyl>
}