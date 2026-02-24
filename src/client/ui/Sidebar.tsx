import { Home, Heart, AudioLines, User, Sliders, Tag, Library, LogOut } from 'lucide-react';

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
    const navItems = [
        { id: 'home', icon: Home },
        { id: 'library', icon: Library },
        { id: 'music', icon: AudioLines },
        { id: 'profile', icon: User },
        { id: 'settings', icon: Sliders },
        { id: 'logout', icon: LogOut },
    ];

    return (
        <aside className="w-20 bg-zinc-200 border-r border-zinc-300 flex flex-col items-center gap-6 pt-6">
        {navItems.map((item) => (
            <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`p-3 rounded-xl transition-colors aspect-square ${
            activeSection === item.id
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-600 hover:bg-zinc-300'
            }`}
            >
            <item.icon className="w-6 h-6" />
            </button>
        ))}
        </aside>
    );
}
