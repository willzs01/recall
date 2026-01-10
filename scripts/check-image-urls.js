require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { Mistral } = require('@mistralai/mistralai');

async function checkImageUrls() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const idx = pc.index(process.env.PINECONE_INDEX_NAME);
    const ns = idx.namespace(process.env.PINECONE_NAMESPACE || 'clinic');

    const emb = await mistral.embeddings.create({
        model: 'mistral-embed',
        inputs: ['Judge blender parts exploded diagram']
    });

    const res = await ns.query({
        vector: emb.data[0].embedding,
        topK: 5,
        includeMetadata: true
    });

    console.log('=== Checking Image URLs ===\n');

    for (const match of res.matches) {
        const imageUrl = match.metadata?.ImageUrl;
        console.log('Score:', match.score?.toFixed(4));
        console.log('ImageUrl:', imageUrl || 'NOT SET');

        if (imageUrl) {
            // Try to fetch the image to see if it exists
            try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                console.log('Image Status:', response.status, response.ok ? '✅ EXISTS' : '❌ NOT FOUND');
            } catch (err) {
                console.log('Image Status: ❌ FETCH ERROR', err.message);
            }
        }
        console.log('Text preview:', String(match.metadata?.text || '').substring(0, 80) + '...');
        console.log('---');
    }
}

checkImageUrls().catch(console.error);
