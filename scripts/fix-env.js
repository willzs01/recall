const fs = require('fs');
const path = '.env.local';

const content = `NEXT_PUBLIC_SUPABASE_URL=https://fp3esnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwM2VzbnIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTA2NTYwMCwiZXhwIjoyMDUwNjQxNjAwfQ.J9K9_Q9J9_Q9J9_Q9J9_Q9_Q9J9_Q9J9_Q9J9_Q
PINECONE_API_KEY=pcsk_61N9rf_2oqusUXiwFZsd8rjSdBd4isgxuMpLxAQ5Kzb24946QCFzgL5H8cXsvfQKBrLhEc
MISTRAL_API_KEY=Y0EDS8f9cbWFU1ATpBgVZovunfi9XghR
GEMINI_API_KEY=AIzaSyBsVqitwOqEEjHdlJstVKD8n9n11KKVKM8
PINECONE_INDEX_NAME=securerag
`;

try {
    fs.writeFileSync(path, content.trim());
    console.log('Successfully repaired .env.local');
} catch (err) {
    console.error('Error fixing .env.local:', err);
}
