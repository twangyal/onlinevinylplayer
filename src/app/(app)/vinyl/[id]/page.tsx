import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { createSupabaseServerClient } from "@/src/db/serverClient";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Disc3, ArrowLeft, Music, Play } from "lucide-react";

export default async function VinylDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params; 
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/play");

  try {
    const vinyl = await vinylRepositorySupabase.getTracks(id, user.id);
    
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-white overflow-x-hidden p-6 sm:p-12">
        {/* Background decorations */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
        
        <div className="z-10 w-full max-w-4xl flex flex-col h-full relative">
          
          {/* Header Navigation */}
          <header className="mb-12 mt-4">
            <Link 
              href="/collection" 
              className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors mb-6 font-medium"
            >
              <ArrowLeft size={18} />
              Back to Collection
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <div className="absolute inset-0 bg-stone-950 rounded-full shadow-2xl flex items-center justify-center border border-stone-800 animate-[spin_20s_linear_infinite]">
                    {/* Grooves */}
                    <div className="w-[90%] h-[90%] rounded-full border border-stone-800/40" />
                    <div className="absolute w-[70%] h-[70%] rounded-full border border-stone-800/40" />
                    <div className="absolute w-[50%] h-[50%] rounded-full border border-stone-800/40" />
                    {/* Center Label */}
                    <div className="absolute w-[33%] h-[33%] rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-inner flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-stone-950" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-500 mb-2">
                    {vinyl.name}
                  </h1>
                  <p className="text-stone-600 dark:text-stone-400 font-medium flex items-center gap-2">
                    <Disc3 size={18} />
                    {vinyl.numberOfTracks} {vinyl.numberOfTracks === 1 ? 'Track' : 'Tracks'}
                  </p>
                </div>
              </div>
              
              <Link 
                href={`/play/single?vinylId=${vinyl.id}`}
                className="group flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-3.5 px-6 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex-shrink-0"
              >
                <Play size={18} fill="currentColor" className="group-hover:text-amber-500 transition-colors" />
                Play Record
              </Link>
            </div>
          </header>

          {/* Tracklist Section */}
          <div className="w-full bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3">
              <Music className="text-amber-500" size={24} />
              Tracklist
            </h2>

            {vinyl.tracks[0].length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/40 dark:bg-stone-800/40 border border-dashed border-stone-300 dark:border-stone-700">
                <p className="text-stone-600 dark:text-stone-400 font-medium">This record has no tracks yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {vinyl.tracks[1].map((meta, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/50 transition-all group"
                  >
                    <span className="w-8 text-center text-stone-400 dark:text-stone-500 font-mono font-medium text-sm group-hover:text-amber-500 transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-bold text-stone-900 dark:text-white text-lg flex-1">
                      {meta.name}
                    </span>
                    {/* Visualizer bars placeholder on hover for extra juice */}
                    <div className="hidden sm:flex items-end gap-1 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 bg-amber-500 rounded-t-sm h-[40%] animate-[bounce_1s_ease-in-out_infinite]" />
                      <div className="w-1 bg-amber-500 rounded-t-sm h-[80%] animate-[bounce_1.2s_ease-in-out_infinite]" />
                      <div className="w-1 bg-orange-500 rounded-t-sm h-[60%] animate-[bounce_0.8s_ease-in-out_infinite]" />
                      <div className="w-1 bg-orange-500 rounded-t-sm h-[100%] animate-[bounce_1.5s_ease-in-out_infinite]" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
