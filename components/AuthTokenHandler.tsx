'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/**
 * Client-side component that handles Supabase auth tokens from URL hash.
 * This is necessary because invite links use hash fragments (#access_token=...)
 * which are not sent to the server and must be handled client-side.
 */
export function AuthTokenHandler() {
    const router = useRouter();

    useEffect(() => {
        const handleHashTokens = async () => {
            // Check if there's a hash with tokens
            const hash = window.location.hash;
            if (!hash || hash.length < 2) return;

            // Parse the hash fragment
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const type = params.get('type');

            // Only handle if we have the required tokens
            if (!accessToken || !refreshToken) return;

            console.log('[AuthTokenHandler] Detected auth tokens in URL hash, type:', type);

            try {
                const supabase = createClient();

                // Set the session using the tokens from the URL
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) {
                    console.error('[AuthTokenHandler] Failed to set session:', error);
                    // Clear hash and redirect to login with error
                    window.history.replaceState(null, '', window.location.pathname);
                    router.push('/login?error=Invalid or expired invite link');
                    return;
                }

                console.log('[AuthTokenHandler] Session established for:', data.user?.email);

                // Clear the hash from URL (security best practice)
                window.history.replaceState(null, '', window.location.pathname);

                // For invite type, redirect to password setup
                if (type === 'invite') {
                    console.log('[AuthTokenHandler] Invite detected, redirecting to password setup');
                    router.push('/set-password');
                } else {
                    // Other types (recovery, etc.) go to chat
                    router.push('/chat');
                }
            } catch (err) {
                console.error('[AuthTokenHandler] Error handling tokens:', err);
                window.history.replaceState(null, '', window.location.pathname);
                router.push('/login?error=Something went wrong');
            }
        };

        handleHashTokens();
    }, [router]);

    // This component doesn't render anything
    return null;
}
