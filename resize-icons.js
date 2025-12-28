const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function resize() {
    try {
        const input = path.join(__dirname, 'public', 'icon-512.png');

        // Create 192x192
        await sharp(input)
            .resize(192, 192)
            .toFile(path.join(__dirname, 'public', 'icon-192.png'));
        console.log('Created icon-192.png');

        // Create 512x512
        await sharp(input)
            .resize(512, 512)
            .toFile(path.join(__dirname, 'public', 'icon-512-fixed.png'));
        console.log('Created icon-512-fixed.png');

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resize();
