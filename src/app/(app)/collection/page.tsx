// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/db/serverClient";
import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { Vinyl } from "@/src/model/Vinyl";

export default async function VinylsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const vinyls: Vinyl[] = await vinylRepositorySupabase.listForUser(user.id);

    return (
        <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Your Collection</h1>
        
        {vinyls.length === 0 ? (
            <p>Your record crate is empty. Add some vinyls!</p>
        ) : (
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {vinyls.map((vinyl) => (
                <div 
                key={String(vinyl.id)} 
                style={{ 
                    padding: "1rem", 
                    border: "1px solid #ccc", 
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
                }}
                >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{vinyl.name}</h3>
                <a 
                    href={`/vinyl/${vinyl.id}`} 
                    style={{ color: "#0070f3", textDecoration: "none", fontSize: "0.9rem" }}
                >
                    View Tracks →
                </a>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}