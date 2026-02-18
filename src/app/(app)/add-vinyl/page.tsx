import { createSupabaseServerClient } from "@/src/db/serverClient";
import { redirect } from "next/navigation";
import { AddVinylForm } from "@/src/client/ui/AddVinylForm";

export default async function AddVinylPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1>Add New Vinyl</h1>
            <AddVinylForm userId={user.id} />
        </div>
    );
}