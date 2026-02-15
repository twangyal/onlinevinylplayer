// src/ui/AccountBar.tsx
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseBrowserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AccountBar({ user }: { user: any }) {
    const handleLogout = async () => {
        await supabaseBrowserClient.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <header style={{ padding: "0.5rem 1rem", borderBottom: "1px solid #ccc" }}>
        {user ? (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>{user.email}</span>
            <button onClick={handleLogout}>Log out</button>
            </div>
        ) : (
            <a href="/login">Log in</a>
        )}
        </header>
    );
}
