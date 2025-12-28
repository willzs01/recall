import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

async function check() {
    try {
        console.log('Checking Pinecone connection...');
        const indexes = await pc.listIndexes();
        console.log('Available Indexes:', indexes);
    } catch (err) {
        console.error('Error listing indexes:', err);
    }
}

check();
