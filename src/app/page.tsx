import Link from 'next/link';
import { Disc3, Library, PlusCircle, Headphones, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-white overflow-y-auto overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
      
      {/* Spinning abstract record background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-5 pointer-events-none">
         <div className="w-[800px] h-[800px] rounded-full border-[40px] border-black dark:border-white border-dashed animate-[spin_60s_linear_infinite]" />
         <div className="absolute w-[600px] h-[600px] rounded-full border-[20px] border-black dark:border-white border-dotted animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <main className="z-10 flex flex-col items-center text-center px-6 max-w-4xl py-20">
        <div className="mb-8 relative flex items-center justify-center">
           <div className="absolute w-32 h-32 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-full blur-2xl opacity-30 dark:opacity-50 animate-pulse" />
           <Disc3 size={80} className="text-stone-900 dark:text-white drop-shadow-xl dark:drop-shadow-2xl animate-[spin_4s_linear_infinite]" />
        </div>

        <h1 className="mb-4 text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-500 drop-shadow-sm">
          Vinyl Player<br />Digital Sim.
        </h1>
        
        <p className="mb-10 text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl font-light leading-relaxed">
          Curate, manage, and experience a vinyl collection online. 
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link 
            href="/collection" 
            className="group relative flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-stone-900 dark:bg-white px-8 font-medium text-white dark:text-black transition-all hover:scale-105 hover:bg-stone-800 dark:hover:bg-stone-200 active:scale-95 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <Library size={20} className="group-hover:-rotate-12 transition-transform" />
            View Collection
          </Link>
          
          <Link 
            href="/play/local" 
            className="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-full border border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md px-8 font-medium text-stone-700 dark:text-white transition-all hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-400 dark:hover:border-stone-500 active:scale-95"
          >
            <PlusCircle size={20} className="text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
            Start Playing
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl text-left">
          <div className="flex flex-col items-center sm:items-start p-6 rounded-2xl bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Headphones size={20} />
            </div>
            <h3 className="text-stone-900 dark:text-stone-100 font-semibold mb-2">Immersive Audio</h3>
            <p className="text-stone-600 dark:text-stone-500 text-sm">Experience a digital player online</p>
          </div>
          <div className="flex flex-col items-center sm:items-start p-6 rounded-2xl bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
              <Sparkles size={20} />
            </div>
            <h3 className="text-stone-900 dark:text-stone-100 font-semibold mb-2">Visual Fidelity</h3>
            <p className="text-stone-600 dark:text-stone-500 text-sm">An interface that pays homage to the physical medium of vinyl records.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start p-6 rounded-2xl bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
              <Library size={20} />
            </div>
            <h3 className="text-stone-900 dark:text-stone-100 font-semibold mb-2">Online Library</h3>
            <p className="text-stone-600 dark:text-stone-500 text-sm">Your entire collection, accessible and managed online.</p>
          </div>
        </div>
      </main>
    </div>
  );
}