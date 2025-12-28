'use client'

import { MessageSquare, Plus, PanelLeftClose, X, LogOut, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    onNewChat: () => void
    onSelectChat?: (id: string) => void
    refreshTrigger?: number
    currentChatId?: string | null
}

interface Chat {
    id: string
    title: string
    created_at: string
}

export function Sidebar({ isOpen, onClose, onNewChat, onSelectChat, refreshTrigger, currentChatId }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchUserAndChats = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email ?? null)
                fetchChats(user.id)
            }
        }
        fetchUserAndChats()
    }, [refreshTrigger]) // Re-fetch when trigger changes

    const fetchChats = async (userId: string) => {
        setLoading(true)
        const { data } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setChats(data)
        }
        setLoading(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation() // Prevent selecting the chat when clicking delete

        if (!confirm('Delete this chat?')) return

        // Delete messages first (foreign key constraint)
        await supabase.from('messages').delete().eq('chat_id', chatId)
        // Then delete the chat
        await supabase.from('chats').delete().eq('id', chatId)

        // Update local state
        setChats(chats.filter(c => c.id !== chatId))

        // If deleted chat was selected, trigger new chat
        if (currentChatId === chatId) {
            onNewChat()
        }
    }

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-zinc-950 border-r border-white/10 transition-transform duration-300 ease-in-out md:relative md:transition-all ${isOpen
                        ? 'translate-x-0'
                        : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-white/5 shrink-0">
                    <Link href="/" className={`flex items-center gap-2 font-semibold text-white transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-xl tracking-tight">Recall</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        {/* Desktop close button */}
                        <button
                            onClick={onClose}
                            className="hidden md:flex rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                            title="Close Sidebar"
                        >
                            <PanelLeftClose className="h-5 w-5" />
                        </button>
                        {/* Mobile close button - only in sidebar header */}
                        <button
                            onClick={onClose}
                            className="flex md:hidden rounded-lg p-2.5 text-zinc-400 hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={onNewChat}
                        className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 ring-1 ring-white/10"
                    >
                        <Plus className="h-5 w-5" />
                        New Chat
                    </button>

                    <div className="mt-8">
                        <h3 className="px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Recent
                        </h3>
                        <div className="mt-4 space-y-1">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                </div>
                            ) : chats.length === 0 ? (
                                <p className="px-2 text-sm text-zinc-500">No chats yet</p>
                            ) : (
                                chats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => onSelectChat?.(chat.id)}
                                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation ${currentChatId === chat.id ? 'bg-white/10 text-white' : 'text-zinc-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            <MessageSquare className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{chat.title}</span>
                                        </div>
                                        <div
                                            onClick={(e) => handleDeleteChat(e, chat.id)}
                                            className="md:opacity-0 md:group-hover:opacity-100 opacity-100 p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 active:bg-red-500/30 transition-all shrink-0 touch-manipulation"
                                            title="Delete chat"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className={`border-t border-white/5 p-4 shrink-0 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between gap-3 px-2 py-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">U</div>
                            <div className="flex-1 overflow-hidden text-left">
                                <p className="truncate font-medium text-white">User</p>
                                <p className="truncate text-xs">{userEmail || 'Loading...'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
