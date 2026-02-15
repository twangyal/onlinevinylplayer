// src/app/playlists/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

export default async function PlaylistsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return <h1>Playlists for {user.id} and {user.email}</h1>;
}
