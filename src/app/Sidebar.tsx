import { Home, Heart, AudioLines, User, Sliders, Tag, Library, LogOut, LogIn } from 'lucide-react';
import Link from "next/link";
import { createSupabaseServerClient } from "@/src/db/serverClient";
import { signOut } from "@/src/app/(app)/logout/actions";

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export async function Sidebar() {
    const user = process.env.NODE_ENV === 'development'
        ? null
        : (await (await createSupabaseServerClient()).auth.getUser()).data.user;

    const navItems = [
        { id: '/', icon: Home },
        { id: '/play/local', icon: AudioLines },
        { id: '/collection', icon: Library },
        { id: '/add-vinyl', icon: Sliders },
        { id: '/profile', icon: User },
    ];

    return (
        <aside className="w-20 min-w-20 max-w-20 bg-stone-200 border-r border-stone-300 flex flex-col items-center gap-16 pt-16">
        {navItems.map((item) => (
            <button
            key={item.id}
            >
            <Link href={item.id}>
            <item.icon className="w-6 h-6" />
            </Link>
            </button>
        ))}
        <nav className="cursor-pointer">
            {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <form action={signOut}>
                <button type="submit"><LogOut className="w-6 h-6 cursor-pointer" /></button>
                </form>
            </div>
            ) : (
                <Link href="/login">
                <LogIn className="w-6 h-6" />
                </Link>
            )}
        </nav>
        </aside>
    );
}
