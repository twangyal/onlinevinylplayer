import { login, signup } from './actions'
import { Disc3, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-white overflow-hidden p-4">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 dark:bg-amber-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] pointer-events-none" />
            
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors z-20">
                <Disc3 size={24} className="animate-[spin_4s_linear_infinite]" />
                <span className="font-bold tracking-tight">Vinyl Player</span>
            </Link>

            <div className="z-10 w-full max-w-md bg-white/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-500 mb-2">Welcome Back</h1>
                    <p className="text-stone-600 dark:text-stone-400 font-medium">Sign in to your vinyl collection</p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-stone-700 dark:text-stone-300">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                id="email" 
                                name="email" 
                                type="email" 
                                required 
                                className="w-full bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-900 dark:text-white shadow-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-bold text-stone-700 dark:text-stone-300">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                                <Lock size={18} />
                            </div>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                className="w-full bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-stone-900 dark:text-white shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            formAction={login}
                            className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-3.5 px-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                        >
                            Log in <ArrowRight size={18} />
                        </button>
                        <button 
                            formAction={signup}
                            className="w-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
                        >
                            <UserPlus size={18} /> Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
