import { createSupabaseServerClient } from "../db/serverClient";

export async function getCurrentUser() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error("getCurrentUser error", error);
        return null;
    }

    return user; // null if not logged in
}
