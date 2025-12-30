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
        const queryResponse = await index.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true,
        });

        // 4. Construct Context
        const contextText = queryResponse.matches
            .map((match) => match.metadata?.text || '')
            .join('\n\n---\n\n');

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

        You have access to the following context from the user's files:
        ---
        ${contextText}
        ---

        Instructions:
        1. If the user asks about the files or content in the context, use the context to answer accurately.
        2. If the context is empty or unhelpful, and the user's query is a general question (like "hello", "help", "who are you", or general knowledge), answer as a helpful assistant using your training data.
        3. Only say "I don't have that information" if the user specifically asks for file-specific data that is missing from the context.
        `;

        const result = await model.generateContentStream({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userQuery }] }
            ],
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
            },
        });

    } catch (error: any) {
        console.error('[RAG Final Catch] Error details:', error);
        return new Response(`Detailed Error: ${error.message || JSON.stringify(error)}`, { status: 500 });
    }
}
