const fs = require('fs');
const path = '.env.local';

try {
    let content = fs.readFileSync(path, 'utf8');
    const regex = /PINECONE_INDEX_NAME=.*/;

    if (regex.test(content)) {
        content = content.replace(regex, 'PINECONE_INDEX_NAME=securerag');
        console.log('Updated PINECONE_INDEX_NAME to securerag');
    } else {
        content += '\nPINECONE_INDEX_NAME=securerag';
        console.log('Appended PINECONE_INDEX_NAME=securerag');
    }

    fs.writeFileSync(path, content);
    console.log('Successfully saved .env.local');
} catch (err) {
    console.error('Error updating .env.local:', err);
}
