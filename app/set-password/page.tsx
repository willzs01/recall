'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // No session - redirect to login
                router.push('/login?error=No active session. Please use your invite link.');
                return;
            }

            setUserEmail(user.email ?? null);
            setCheckingSession(false);
        };

        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            // Update the user's password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
                setLoading(false);
                return;
            }

            // Success - redirect to chat
            router.push('/chat');
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Verifying your session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
            <div className="w-full max-w-sm space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome to Recall</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Set up your password to complete registration
                    </p>
                    {userEmail && (
                        <p className="mt-1 text-sm text-indigo-400">{userEmail}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200 ring-1 ring-red-500/50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up...' : 'Set Password & Continue'}
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-500">
                    By setting your password, you agree to our terms of service.
                </p>
            </div>
        </div>
    );
}
