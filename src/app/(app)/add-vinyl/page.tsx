import { createSupabaseServerClient } from "@/src/db/serverClient";
import { redirect } from "next/navigation";
import { AddVinylForm } from "@/src/client/ui/AddVinylForm";
import Link from "next/link";
import { ArrowLeft, DiscAlbum } from "lucide-react";

export default async function AddVinylPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-white overflow-x-hidden p-6 sm:p-12">
            {/* Background decorations */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
            
            <div className="z-10 w-full max-w-2xl flex flex-col h-full relative">
                <header className="mb-8 mt-4">
                    <Link 
                        href="/collection" 
                        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors mb-6 font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Collection
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <DiscAlbum size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-500">
                                Press New Vinyl
                            </h1>
                            <p className="text-stone-600 dark:text-stone-400 font-medium">
                                Upload your audio tracks to create a digital record.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="w-full bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl">
                    <AddVinylForm userId={user.id} />
                </div>
            </div>
        </div>
    );
}
