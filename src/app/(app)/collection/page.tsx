import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/db/serverClient";
import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { Vinyl } from "@/src/model/Vinyl";
import Link from 'next/link';
import { Disc3, Plus, Play } from 'lucide-react';

export default async function VinylsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const vinyls: Vinyl[] = await vinylRepositorySupabase.listForUser(user.id);

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-white overflow-x-hidden p-6 sm:p-12">
            {/* Background decorations */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
            
            <div className="z-10 w-full max-w-7xl flex flex-col h-full relative">
                <header className="flex items-center justify-between mb-16 mt-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-500">
                            Your Collection
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 mt-2 font-medium">
                            {vinyls.length} {vinyls.length === 1 ? 'record' : 'records'} in your crate
                        </p>
                    </div>
                    
                    <Link 
                        href="/add-vinyl" 
                        className="group flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-3 px-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Record</span>
                    </Link>
                </header>

                {vinyls.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/40 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-xl rounded-3xl mt-12">
                        <Disc3 size={64} className="text-stone-300 dark:text-stone-700 mb-6" />
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">Your crate is empty</h2>
                        <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md">
                            Start building your digital vinyl collection. Add your first record to see it appear on your shelf.
                        </p>
                        <Link 
                            href="/add-vinyl" 
                            className="bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Add Your First Vinyl
                        </Link>
                    </div>
                ) : (
                    <div className="w-full pb-32 pt-8">
                        {/* Shelf structural background lines for visual grounding */}
                        <div className="absolute inset-0 pointer-events-none -z-10" style={{
                            backgroundImage: 'linear-gradient(to bottom, transparent 96%, rgba(161, 161, 170, 0.2) 96%, rgba(161, 161, 170, 0.2) 100%)',
                            backgroundSize: '100% 280px' // Adjust to match row height
                        }}></div>

                        {/* The Grid of Vinyls */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-24">
                            {vinyls.map((vinyl) => (
                                <Link href={`/vinyl/${vinyl.id}`} key={String(vinyl.id)} className="group relative block w-full outline-none mt-auto">
                                    
                                    {/* The item on the shelf */}
                                    <div className="relative w-full aspect-square transition-all duration-500 ease-out group-hover:-translate-y-12 group-hover:scale-110 z-10 group-hover:z-50">
                                        
                                        {/* Vinyl Disc that slides out on hover */}
                                        <div className="absolute inset-0 bg-stone-950 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out group-hover:-translate-y-8 group-hover:translate-x-12 -z-10 flex items-center justify-center border border-stone-800">
                                            {/* Grooves */}
                                            <div className="w-[95%] h-[95%] rounded-full border border-stone-800/40" />
                                            <div className="absolute w-[80%] h-[80%] rounded-full border border-stone-800/40" />
                                            <div className="absolute w-[65%] h-[65%] rounded-full border border-stone-800/40" />
                                            <div className="absolute w-[50%] h-[50%] rounded-full border border-stone-800/40" />
                                            
                                            {/* Center Label */}
                                            <div className="absolute w-[33%] h-[33%] rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-inner flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-stone-950" />
                                            </div>
                                        </div>

                                        {/* The Sleeve Cover */}
                                        <div className="relative w-full h-full bg-stone-200 dark:bg-stone-800 rounded-md shadow-2xl border border-stone-300 dark:border-stone-700 overflow-hidden flex flex-col justify-end p-4 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:z-10">
                                            {/* Abstract Cover Art */}
                                            <div className="absolute inset-0 opacity-80 mix-blend-multiply dark:mix-blend-overlay">
                                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400/50 to-orange-400/50" />
                                                {/* Textural dots for an analog feel */}
                                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px]" />
                                            </div>
                                            
                                            <div className="relative z-20 w-full bg-black/20 dark:bg-black/40 backdrop-blur-sm p-3 -mx-4 -mb-4 rounded-b-md border-t border-white/10">
                                                <h3 className="text-white font-bold text-base md:text-lg leading-tight truncate drop-shadow-md">
                                                    {vinyl.name}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 transform group-hover:translate-y-0 translate-y-2">
                                                    <Play size={12} fill="currentColor" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Play</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Shelf Shadow underneath the item */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-stone-400/40 dark:bg-black/60 rounded-full blur-[6px] opacity-60 group-hover:w-[100%] group-hover:opacity-30 group-hover:blur-[10px] transition-all duration-500 -z-20" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
