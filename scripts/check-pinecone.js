const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

async function check() {
    try {
        console.log('Checking Pinecone connection...');
        const indexName = process.env.PINECONE_INDEX_NAME;

        if (!indexName) {
            console.error('PINECONE_INDEX_NAME is not set in .env.local');
            return;
        }

        console.log(`Inspecting index: ${indexName}`);
        const index = pc.index(indexName);

        const stats = await index.describeIndexStats();
        console.log('Index Stats:', JSON.stringify(stats, null, 2));

        const replaceFs = require('fs');
        replaceFs.writeFileSync('pinecone_stats.json', JSON.stringify(stats, null, 2));

    } catch (err) {
        console.error('Error checking Pinecone:', err);
    }
}

check();
