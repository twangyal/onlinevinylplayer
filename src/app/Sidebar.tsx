import { Home, Heart, AudioLines, User, Sliders, Tag, Library, LogOut } from 'lucide-react';
import Link from "next/link";


interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export function Sidebar() {
    const navItems = [
        { id: '/', icon: Home },
        { id: '/collection', icon: Library },
        { id: '/play/local', icon: AudioLines },
        { id: '/profile', icon: User },
        { id: '/add-vinyl', icon: Sliders },
        { id: '/logout', icon: LogOut },
    ];

    return (
        <aside className="w-20 min-w-20 max-w-20 bg-zinc-200 border-r border-zinc-300 flex flex-col items-center gap-16 pt-16">
        {navItems.map((item) => (
            <button
            key={item.id}
            >
            <Link href={item.id}>
            <item.icon className="w-6 h-6" />
            </Link>
            </button>
        ))}
        </aside>
    );
}
