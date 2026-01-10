import { NextRequest } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { createClient } from '@/utils/supabase/server';



export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log('[RAG Debug] Request started');

    try {
        // Validate API Keys
        if (!process.env.MISTRAL_API_KEY) throw new Error('Missing MISTRAL_API_KEY');
        if (!process.env.PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY');
        if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

        // Initialize Clients
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('[RAG Debug] Using Pinecone Index:', process.env.PINECONE_INDEX_NAME);
        const { messages, chatId } = await req.json();

        // Get the last message
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // 1. Authenticate User
        console.log('[RAG Debug] Creating Supabase client...');
        const supabase = await createClient();
        console.log('[RAG Debug] Getting user...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[RAG Debug] Auth Error:', authError);
            // Don't throw here, just handle as unauthorized if no user
        }

        if (!user) {
            console.warn('[RAG Debug] No user found');
            return new Response('Unauthorized', { status: 401 });
        }

        /*
        if (authError) {
            console.error('[RAG Debug] Auth Error:', authError);
            // Don't throw here, just handle as unauthorized if no user
        }

        if (!user) {
            console.warn('[RAG Debug] No user found');
            return new Response('Unauthorized', { status: 401 });
        }
        */
        console.log('[RAG Debug] User authenticated:', user.id);

        // 2. Embed the user's query
        console.log('[RAG Debug] Generating embedding...');
        const embeddingResponse = await mistral.embeddings.create({
            model: 'mistral-embed',
            inputs: [userQuery],
        });
        const embedding = embeddingResponse.data[0].embedding;

        if (!embedding) {
            throw new Error('Failed to generate embedding');
        }

        // 3. Query Pinecone
        console.log('[RAG Debug] Querying Pinecone...');
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
        const namespace = index.namespace(process.env.PINECONE_NAMESPACE || 'clinic');
        const queryResponse = await namespace.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true,
        });



        // 4. Construct Context
        // Debug: Log all metadata fields to identify image URL field name
        console.log('[RAG Debug] Pinecone matches metadata:');
        queryResponse.matches.forEach((match, i) => {
            console.log(`  Match ${i + 1} keys:`, Object.keys(match.metadata || {}));
            // Log any values that look like URLs
            Object.entries(match.metadata || {}).forEach(([key, val]) => {
                if (typeof val === 'string' && (val.includes('http') || key.toLowerCase().includes('url') || key.toLowerCase().includes('image'))) {
                    console.log(`    ${key}:`, val);
                }
            });
        });

        // Helper function to sanitize text by removing non-Supabase image URLs
        const sanitizeTextUrls = (text: string): string => {
            // Remove markdown image links that don't point to our Supabase storage
            // Matches: ![...](URL) or **Image URL:** URL patterns
            const supabaseHost = 'qsektseuyzuyxuksniqs.supabase.co';

            // Remove markdown images with non-Supabase URLs: ![alt](url)
            let sanitized = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
                if (url.includes(supabaseHost)) return match; // Keep Supabase URLs
                return `[Image: ${alt || 'see below'}]`; // Replace with placeholder
            });

            // Remove **Image URL:** or **URL:** patterns with non-Supabase URLs
            sanitized = sanitized.replace(/\*\*(?:Image\s+)?URL:\*\*\s*(https?:\/\/[^\s]+)/gi, (match, url) => {
                if (url.includes(supabaseHost)) return match; // Keep Supabase URLs
                return '[Image URL removed - see image below]'; // Replace
            });

            return sanitized;
        };

        const contextText = queryResponse.matches
            .map((match) => {
                let text = (match.metadata?.text as string) || '';
                // Sanitize text to remove broken external URLs
                text = sanitizeTextUrls(text);

                // Check multiple possible field names for image URLs
                const imageUrl = (
                    match.metadata?.ImageUrl ||  // n8n pipeline uses this
                    match.metadata?.image_url ||
                    match.metadata?.imageUrl ||
                    match.metadata?.url ||
                    match.metadata?.file_url ||
                    match.metadata?.image ||
                    match.metadata?.publicUrl
                ) as string | undefined;

                if (imageUrl) {
                    console.log('[RAG Debug] Found image URL:', imageUrl);
                    return `[Context Image: ${imageUrl}]\n${text}`;
                }
                return text;
            })
            .join('\n\n---\n\n');

        // 4b. Extract source citations from matches
        const sources = queryResponse.matches
            .map((match) => ({
                file: (match.metadata?.filefrom || match.metadata?.fileName || 'Unknown') as string,
                page: (match.metadata?.['page number'] || match.metadata?.['page no'] || null) as number | null,
                score: match.score || 0
            }))
            .filter(s => s.file !== 'Unknown')
            // Remove duplicates by file+page
            .filter((s, i, arr) => arr.findIndex(x => x.file === s.file && x.page === s.page) === i)
            // Sort by score (highest first)
            .sort((a, b) => b.score - a.score)
            // Take top 3 sources
            .slice(0, 3);

        console.log('[RAG Debug] Sources:', sources.map(s => `${s.file}${s.page ? ` (p.${s.page})` : ''}`).join(', '));

        console.log(`[RAG] Found ${queryResponse.matches.length} matches`);


        // 5. Save User Message to DB (if chatId exists)
        // If it's a new chat, we might want to create it first or handle it on the client.
        // For simplicity, we assume client handles chat creation or we do it here if chatId is null?
        // Let's assume the Client sends a chatId, or if not, we create one.

        let activeChatId = chatId;
        if (!activeChatId) {
            console.log('[RAG Debug] Creating new chat...');
            // Create new chat
            const title = userQuery.slice(0, 50);
            const { data: chatData, error: chatError } = await supabase
                .from('chats')
                .insert({ user_id: user.id, title })
                .select()
                .single();

            if (chatError) {
                console.error('[RAG Debug] Chat Creation Error:', chatError);
                throw new Error(`Failed to create chat: ${chatError.message}`);
            }
            activeChatId = chatData.id;
        }

        console.log('[RAG Debug] Saving user message...');
        const { error: msgError } = await supabase.from('messages').insert({
            chat_id: activeChatId,
            role: 'user',
            content: userQuery,
        });

        if (msgError) {
            console.error('[RAG Debug] Message Save Error:', msgError);
            throw new Error(`Failed to save message: ${msgError.message}`);
        }


        // 6. Generate Response with Gemini
        console.log('[RAG Debug] Generating content with Gemini...');
        const systemPrompt = `You are Recall, an intelligent AI assistant.

        You have access to the following context from the user's files. Images are marked with [Context Image: URL] - these are the ONLY valid image URLs you should use.
        ---
        ${contextText}
        ---

        Instructions:
        1. If the user asks about the files or content in the context, use the context to answer accurately.
        2. IMPORTANT: When displaying images, ONLY use URLs from [Context Image: URL] markers. Do NOT use any other URLs mentioned in the text content - they may be outdated or broken.
        3. To display an image, use Markdown format: ![Image Description](URL) where URL is from a [Context Image: ...] marker.
        4. Describe the image based on the text context provided with it if asked.
        5. If the context is empty or unhelpful, and the user's query is a general question (like "hello", "help", "who are you", or general knowledge), answer as a helpful assistant using your training data.
        6. Only say "I don't have that information" if the user specifically asks for file-specific data that is missing from the context.
        7. Remember the conversation context - if the user refers to something from earlier in the chat, use that context to respond appropriately.
        `;

        // Build conversation history for Gemini (last 10 messages for context)
        const recentMessages = messages.slice(-10);
        console.log(`[RAG Debug] Including ${recentMessages.length} messages in context`);

        // Convert messages to Gemini format
        // Gemini uses 'user' and 'model' roles
        const conversationHistory = recentMessages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Build contents array: system context first, then conversation history
        const contents = [
            // System prompt with RAG context
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Understood. I'll help you with your files and questions, and remember our conversation context." }] },
            // Conversation history
            ...conversationHistory
        ];

        const result = await model.generateContentStream({
            contents,
        });

        // Handle Streaming Response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = '';
                for await (const chunk of result.stream) {
                    const content = chunk.text();
                    if (content) {
                        fullResponse += content;
                        controller.enqueue(encoder.encode(content));
                    }
                }

                // 7. Save Assistant Message to DB
                console.log('[RAG Debug] Saving assistant response...');
                await supabase.from('messages').insert({
                    chat_id: activeChatId,
                    role: 'assistant',
                    content: fullResponse,
                });

                controller.close();
            },
        });

        // Return the stream and the Key info (like chatId) in headers if possible, 
        // but usually standard stream is just text. 
        // We will return the stream.Client needs to handle chatId if it was created new.
        // Ideally, we return a JSON with chatId first, but streaming text is different.
        // Strategy: Client creates Chat ID first OR we just return the stream and Client refreshes list.
        // Let's stick to: Client manages Chat ID creation ideally, OR we return it in a header.

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'x-chat-id': activeChatId, // Send back the chat ID so client knows
                'x-sources': JSON.stringify(sources.map(s => ({ file: s.file, page: s.page }))),
            },
        });

    } catch (error: any) {
        console.error('[RAG Final Catch] Error details:', error);
        return new Response(`Detailed Error: ${error.message || JSON.stringify(error)}`, { status: 500 });
    }
}
