const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function resize() {
    try {
        // Use rebrand.png as the source for all icons (now with transparent bg)
        const input = path.join(__dirname, 'public', 'rebrand.png');

        // Create 192x192 for PWA - preserve transparency
        await sharp(input)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
            })
            .png()
            .toFile(path.join(__dirname, 'public', 'icon-192.png'));
        console.log('Created icon-192.png');

        // Create 512x512 for PWA - preserve transparency
        await sharp(input)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
            })
            .png()
            .toFile(path.join(__dirname, 'public', 'icon-512.png'));
        console.log('Created icon-512.png');

        // Create favicon.ico sized versions with transparency
        const faviconSizes = [16, 32, 48, 64, 128, 180];
        for (const size of faviconSizes) {
            await sharp(input)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
                })
                .png()
                .toFile(path.join(__dirname, 'public', `icon-${size}.png`));
            console.log(`Created icon-${size}.png`);
        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resize();
