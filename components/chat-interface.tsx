'use client'

import { Send, Menu, Mic, SquarePen, ThumbsUp, ThumbsDown, MoreHorizontal, PanelLeftOpen, Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './sidebar'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Add SpeechRecognition types to global window object
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export function ChatInterface() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chatId, setChatId] = useState<string | null>(null)
    const [refreshSidebarTrigger, setRefreshSidebarTrigger] = useState(0)

    // Supabase client
    const supabase = createClient()

    // Manual State Management
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<Array<{ id: string, role: 'user' | 'assistant', content: string }>>([])
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const recognitionRef = useRef<any>(null)
    const processedIndexRef = useRef(-1)
    const [interimTranscript, setInterimTranscript] = useState('')

    // Auto-scroll to bottom only on mount or manual trigger
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, []) // Removed [messages] dependency to prevent auto-scrolling during stream

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'en-US'

                recognition.onstart = () => {
                    setIsListening(true)
                }
                recognition.onend = () => {
                    setIsListening(false)
                    setInterimTranscript('')
                }

                recognition.onresult = (event: any) => {
                    let finalTranscripts = ''
                    let interimTranscripts = ''

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript
                        if (event.results[i].isFinal) {
                            finalTranscripts += transcript + ' '
                        } else {
                            interimTranscripts += transcript
                        }
                    }

                    if (finalTranscripts) {
                        setInputValue(prev => {
                            const trimmedPrev = prev.trim()
                            const newContent = trimmedPrev
                                ? `${trimmedPrev} ${finalTranscripts.trim()}`
                                : finalTranscripts.trim()
                            return newContent
                        })
                    }
                    setInterimTranscript(interimTranscripts)
                }

                recognition.onerror = (event: any) => {
                    if (event.error === 'no-speech') {
                        setIsListening(false)
                        return // Don't log error for silence
                    }
                    console.error('Speech recognition error', event.error)
                    setIsListening(false)
                }

                recognitionRef.current = recognition

                return () => {
                    recognition.stop()
                }
            }
        }
    }, [])

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in this browser.')
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
        } else {
            processedIndexRef.current = -1
            recognitionRef.current.start()
        }
    }

    // Auto-resize textarea logic
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
        }
    }, [inputValue])

    // handleInputChange logic
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
    }

    // Handle Enter key to submit
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onFormSubmit(e)
        }
    }

    // Custom submit handler
    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const userMessage = {
            id: uuidv4(),
            role: 'user' as const,
            content: inputValue
        }

        // 1. Optimistic Update
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        if (inputRef.current) inputRef.current.style.height = 'auto' // Reset height
        setIsLoading(true)

        // Scroll to bottom immediately to show user message
        setTimeout(scrollToBottom, 100)

        try {
            // 2. Refresh Sidebar if new chat
            if (!chatId) {
                setRefreshSidebarTrigger(prev => prev + 1)
            }

            // 3. Send to API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // IMPORTANT: Send cookies for auth
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chatId
                })
            })

            if (!response.ok) {
                const errorText = await response.text() // Try to get error details from server
                throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${errorText}`)
            }

            // Check for Chat ID header if we want to sync (Optional: backend currently returns it)
            const newChatId = response.headers.get('x-chat-id')
            if (newChatId && !chatId) {
                setChatId(newChatId)
            }

            // 4. Handle Streaming Response
            const reader = response.body?.getReader()
            let assistantMessage = { id: uuidv4(), role: 'assistant' as const, content: '' }

            // Add initial empty assistant message
            setMessages(prev => [...prev, assistantMessage])

            if (reader) {
                const decoder = new TextDecoder()
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    assistantMessage.content += chunk

                    // Update the last message (assistant) with new content
                    setMessages(prev => {
                        const newMessages = [...prev]
                        newMessages[newMessages.length - 1] = { ...assistantMessage }
                        return newMessages
                    })
                }
            }

        } catch (error) {
            console.error('Chat Error:', error)
            // Optional: Error state or toast
        } finally {
            setIsLoading(false)
            // Refocus input on mobile after sending
            inputRef.current?.focus()
        }
    }

    // Responsive sidebar handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false)
            } else {
                setSidebarOpen(true)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // New Chat Function
    const handleNewChat = () => {
        setChatId(null)
        setMessages([])
        setSidebarOpen(true) // Optional: keep sidebar open or close it
    }

    // Load Chat History
    const handleSelectChat = async (id: string) => {
        setChatId(id)
        setSidebarOpen(false) // On mobile, close sidebar after selection

        // Fetch messages for this chat
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', id)
            .order('created_at', { ascending: true })

        if (data) {
            setMessages(data.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content
            })))
            setTimeout(scrollToBottom, 100)
        }
    }



    return (
        <div className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                refreshTrigger={refreshSidebarTrigger}
                currentChatId={chatId}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full overflow-hidden relative">
                {/* Header - Absolute to be fixed at top independent of flow */}
                <header className="absolute top-0 w-full flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-3 md:px-4 z-20 safe-area-top">
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Mobile Menu Button - always visible on mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2.5 text-zinc-400 hover:bg-white/5 hover:text-white active:bg-white/10 md:hidden touch-manipulation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        {/* Desktop Toggle Button - visible only when sidebar is closed */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`hidden md:flex rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-300 ${!sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none w-0 p-0 overflow-hidden'}`}
                            title="Open Sidebar"
                        >
                            <PanelLeftOpen className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-sm font-semibold text-white">Recall</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-zinc-500">Online</span>
                        </div>
                    </div>
                    <button
                        onClick={handleNewChat}
                        className="rounded-lg p-2.5 text-zinc-400 hover:bg-white/5 hover:text-white active:bg-white/10 touch-manipulation"
                        title="New Chat"
                    >
                        <SquarePen className="h-5 w-5" />
                    </button>
                </header>

                {/* Messages - Added top padding to account for absolute header */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-20 scroll-smooth overscroll-contain">
                    <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 mt-16 md:mt-20 px-4 text-center">
                                <p className="text-sm md:text-base">Start a conversation to search your company files.</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] md:text-xs font-medium">
                                        AI
                                    </div>
                                )}

                                <div className={`space-y-1.5 md:space-y-2 max-w-[88%] sm:max-w-[80%] md:max-w-[75%]`}>
                                    <div
                                        className={`rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 text-[15px] md:text-base leading-relaxed shadow-sm ${message.role === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-zinc-900/50 border border-white/5 text-zinc-200'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Styled components for markdown
                                                p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-2">{children}</h3>,
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            className="rounded-lg !my-3 text-sm"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                table: ({ children }) => <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse border border-white/10 text-sm">{children}</table></div>,
                                                th: ({ children }) => <th className="border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold">{children}</th>,
                                                td: ({ children }) => <td className="border border-white/10 px-3 py-2">{children}</td>,
                                                blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500 pl-4 my-3 italic text-zinc-400">{children}</blockquote>,
                                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{children}</a>,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {/* Assistant Actions */}
                                    {message.role === 'assistant' && (
                                        <div className="flex items-center gap-1 pl-1">
                                            <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
                                                <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors ml-1">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {message.role === 'user' && (
                                    <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] md:text-xs font-medium text-white">
                                        U
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 md:gap-3 justify-start">
                                <div className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] md:text-xs font-medium">
                                    AI
                                </div>
                                <div className="rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 bg-zinc-900 border border-white/5 text-zinc-400 text-[15px] md:text-base">
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-2" /> {/* Scroll anchor */}
                    </div>
                </div>

                {/* Input Area - floating at bottom */}
                <div className="sticky bottom-[1.5vh] shrink-0 px-4 pb-2 pt-3 md:px-6 md:pb-2 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-20 safe-area-bottom">
                    <div className="mx-auto max-w-3xl transition-transform duration-200 ease-out focus-within:-translate-y-1 md:focus-within:scale-[1.01]">
                        <form onSubmit={onFormSubmit} className="relative flex items-end rounded-2xl bg-zinc-900/80 ring-1 ring-white/10 focus-within:ring-indigo-500/50 transition-all focus-within:shadow-lg focus-within:shadow-indigo-500/10 backdrop-blur-sm">
                            {/* Attachment button - left edge */}
                            <button type="button" className="p-3 text-zinc-500 hover:text-zinc-300 active:text-zinc-200 transition-colors touch-manipulation mb-0.5" title="Attach file">
                                <Plus className="h-5 w-5" />
                            </button>
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? (interimTranscript || "Listening...") : "Message..."}
                                className="flex-1 w-full bg-transparent py-3 md:py-4 px-1 text-base text-white placeholder:text-zinc-500 focus:outline-none resize-none max-h-[120px] min-h-[50px] overflow-y-auto break-words whitespace-pre-wrap"
                                rows={1}
                                spellCheck="false"
                            />
                            <div className="flex items-center pb-2 pr-1.5 md:pr-2 gap-1 mb-0.5">
                                {/* Mic button - right side */}
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`p-2 transition-all duration-200 touch-manipulation ${isListening ? 'text-red-500 animate-pulse bg-red-500/10 rounded-full' : 'text-zinc-500 hover:text-zinc-300 active:text-zinc-200'}`}
                                    title={isListening ? "Stop listening" : "Start voice input"}
                                >
                                    <Mic className={`h-5 w-5 ${isListening ? 'fill-current' : ''}`} />
                                </button>
                                {/* Send button */}
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-2.5 md:p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors touch-manipulation"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}


