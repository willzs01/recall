import { login } from './actions'
import { SubmitButton } from '@/components/submit-button'
import { MessageSquare, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const searchParams = await props.searchParams
    const error = searchParams.error

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100 relative">
            <div className="w-full max-w-sm space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
                    <p className="mt-2 text-sm text-zinc-400">Sign in to your account</p>
                </div>

                <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-200 text-center">
                        Access requires invite-only credentials. <br />
                        <span className="font-medium text-amber-100">Contact us for a demo account.</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200 ring-1 ring-red-500/50">
                            {error}
                        </div>
                    )}

                    <div>
                        <SubmitButton
                            formAction={login}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            loadingText="Signing in..."
                        >
                            Sign in
                        </SubmitButton>
                    </div>
                </form>
            </div>

            {/* Fixed Contact Icons - Bottom Right */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
                <p className="text-xs text-zinc-500 mb-1">Need access? Contact us:</p>
                <div className="flex gap-2">
                    <Link
                        href="https://wa.me/2349162235619"
                        target="_blank"
                        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] p-3 text-white hover:bg-[#20bd5a] transition-colors shadow-lg"
                        title="WhatsApp"
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Link>
                    <Link
                        href="mailto:williamsfolorunso07@gmail.com"
                        className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 p-3 text-white hover:bg-indigo-500 transition-colors shadow-lg"
                        title="Email"
                    >
                        <Mail className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

