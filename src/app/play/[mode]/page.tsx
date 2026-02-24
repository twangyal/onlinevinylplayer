import { createSupabaseServerClient } from "@/src/db/serverClient";
import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { PlayView } from "@/src/client/ui/PlayView";
import { redirect } from "next/navigation";

export default async function PlayPage({ params }: { params: { mode: string } }) {
    const { mode } = await params; 
    const local = mode === "local" ? true : false;
    const supabase = await createSupabaseServerClient();

    console.log("PlayPage rendered with mode:", mode, "local:", local); // Debug log
    if (!local) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            redirect("/login");
        }
    }
    return (
        <main>
            <PlayView 
                isLoggedIn={!local} 
                initialData={[]}
            />
        </main>
    );
}