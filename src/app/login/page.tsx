"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabaseBrowserClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
        if (mode === "signup") {
            const { error } = await supabaseBrowserClient.auth.signUp({
            email,
            password,
            });
            if (error) throw error;
        } else {
            const { error } = await supabaseBrowserClient.auth.signInWithPassword({
            email,
            password,
            });
            if (error) throw error;
        }

        // After success, redirect; simplest is:
        window.location.href = "/add";
        } catch (err: any) {
        setError(err.message ?? "Something went wrong");
        } finally {
        setLoading(false);
        }
    };

    return (
        <main style={{ maxWidth: 400, margin: "2rem auto" }}>
        <h1>{mode === "signup" ? "Create account" : "Log in"}</h1>

        <form onSubmit={handleSubmit}>
            <label>
            Email
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </label>

            <label>
            Password
            <input
                type="password"
                value={password}
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </label>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" disabled={loading}>
            {loading
                ? "Working..."
                : mode === "signup"
                ? "Sign up"
                : "Log in"}
            </button>
        </form>

        <button
            type="button"
            onClick={() =>
            setMode((m) => (m === "login" ? "signup" : "login"))
            }
        >
            {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
        </main>
    );
}
