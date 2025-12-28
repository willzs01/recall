const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

async function check() {
    try {
        console.log('Checking Pinecone connection...');
        const indexes = await pc.listIndexes();
        const fs = require('fs');
        const output = JSON.stringify(indexes, null, 2);
        console.log('Available Indexes:', output);
        fs.writeFileSync('pinecone_output.json', output);
    } catch (err) {
        console.error('Error listing indexes:', err);
    }
}

check();
