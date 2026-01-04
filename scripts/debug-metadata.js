
const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function debugQuery() {
    try {
        console.log('Generating embedding for "red nike shoe"...');
        const embeddingResponse = await mistral.embeddings.create({
            model: 'mistral-embed',
            inputs: ['red nike shoe'],
        });
        const vector = embeddingResponse.data[0].embedding;

        console.log(`Querying index: ${process.env.PINECONE_INDEX_NAME} (Namespace: ${process.env.PINECONE_NAMESPACE || 'clinic'})...`);
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        const namespace = index.namespace(process.env.PINECONE_NAMESPACE || 'clinic');

        const queryResponse = await namespace.query({
            vector: vector,
            topK: 3,
            includeMetadata: true,
        });

        console.log(`Found ${queryResponse.matches.length} matches.`);
        queryResponse.matches.forEach((match, i) => {
            console.log(`\n--- Match ${i + 1} (Score: ${match.score}) ---`);
            console.log('ID:', match.id);
            console.log('Metadata Keys:', Object.keys(match.metadata || {}));
            console.log('Metadata:', JSON.stringify(match.metadata, null, 2));
        });

    } catch (err) {
        console.error('Error:', err);
    }
}

debugQuery();
