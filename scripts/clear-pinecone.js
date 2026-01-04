
const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

async function clearIndex() {
    try {
        console.log(`Clearing index: ${process.env.PINECONE_INDEX_NAME}...`);
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        const namespace = index.namespace(process.env.PINECONE_NAMESPACE || 'clinic');

        await namespace.deleteAll();
        console.log('✅ Index successfully cleared! It is now empty.');
    } catch (err) {
        console.error('Error clearing index:', err);
    }
}

clearIndex();
