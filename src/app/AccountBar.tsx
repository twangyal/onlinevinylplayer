import { createSupabaseServerClient } from "@/src/db/serverClient";
import { signOut } from "@/src/app/(app)/logout/actions";
import Link from "next/link";

export async function AccountBar() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '1rem', 
        borderBottom: '1px solid #eaeaea' 
        ,
            marginBottom: '-1rem'
        }}>
        <div><Link href="/play/local"><strong>App</strong></Link></div>
        <div><Link href="/add-vinyl">Add Vinyl</Link></div>
        <div><Link href="/collection">My Collection</Link></div>
        
        <nav>
            {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{user.email}</span>
                <form action={signOut}>
                <button type="submit">Log out</button>
                </form>
            </div>
            ) : (
            <Link href="/login">Log in</Link>
            )}
        </nav>
        </header>
    );
}