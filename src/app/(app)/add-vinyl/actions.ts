'use server'

import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { Vinyl } from "@/src/model/Vinyl";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/src/db/serverClient";

export async function saveVinylAction(vinylData: Vinyl) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const result = await vinylRepositorySupabase.addVinyl(vinylData, user.id);
    revalidatePath('/collection');
    return result;
}