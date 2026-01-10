require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { Mistral } = require('@mistralai/mistralai');

async function checkMetadata() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const idx = pc.index(process.env.PINECONE_INDEX_NAME);
    const ns = idx.namespace(process.env.PINECONE_NAMESPACE || 'clinic');

    // Query with an image-related search
    const emb = await mistral.embeddings.create({
        model: 'mistral-embed',
        inputs: ['show me images or photos']
    });

    const res = await ns.query({
        vector: emb.data[0].embedding,
        topK: 5,
        includeMetadata: true
    });

    console.log('Found', res.matches.length, 'matches');
    res.matches.forEach((match, i) => {
        console.log('Match', i + 1, '- Keys:', Object.keys(match.metadata || {}).join(', '));
        // Check for any URL-like values
        Object.entries(match.metadata || {}).forEach(([key, val]) => {
            if (typeof val === 'string' && (val.includes('http') || val.includes('supabase') || key.toLowerCase().includes('url') || key.toLowerCase().includes('image'))) {
                console.log('  Found URL/Image field:', key, '=', val.substring(0, 100));
            }
        });
    });
}

checkMetadata().catch(console.error);
