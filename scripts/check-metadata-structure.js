require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { Mistral } = require('@mistralai/mistralai');

async function checkMetadataStructure() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    const idx = pc.index(process.env.PINECONE_INDEX_NAME);
    const ns = idx.namespace(process.env.PINECONE_NAMESPACE || 'clinic');

    const emb = await mistral.embeddings.create({
        model: 'mistral-embed',
        inputs: ['Judge blender parts']
    });

    const res = await ns.query({
        vector: emb.data[0].embedding,
        topK: 3,
        includeMetadata: true
    });

    console.log('=== Available Metadata Fields ===\n');

    res.matches.forEach((match, i) => {
        console.log(`Match ${i + 1}:`);
        console.log('  All keys:', Object.keys(match.metadata || {}));
        console.log('  ---');
        console.log('  filefrom:', match.metadata?.filefrom);
        console.log('  fileName:', match.metadata?.fileName);
        console.log('  page number:', match.metadata?.['page number']);
        console.log('  page no:', match.metadata?.['page no']);
        console.log('  line:', match.metadata?.line);
        console.log('  source:', match.metadata?.source);
        console.log('  filedir:', match.metadata?.filedir);
        console.log('');
    });
}

checkMetadataStructure().catch(console.error);
