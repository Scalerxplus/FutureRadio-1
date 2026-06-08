const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function scaleIcons() {
  const iconDir = path.join(__dirname, 'public', 'icons');
  const sourceIcon = path.join(iconDir, 'icon-512x512.png');
  const out192 = path.join(iconDir, 'icon-192x192.png');
  const out512 = path.join(iconDir, 'icon-512x512.png');
  const outApple = path.join(iconDir, 'apple-touch-icon.png');
  const outPlayer = path.join(iconDir, 'player-logo.png');

  console.log('Scaling icons to 3x of original size...');

  try {
    // Trim the transparent padding automatically to get just the logo
    const trimmedBuffer = await sharp(sourceIcon)
      .trim()
      .toBuffer();

    // Scale the logo to 300x300 (which gives generous padding around it, making it 3x instead of 5x)
    const baseIcon = await sharp(trimmedBuffer)
      .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 106, bottom: 106, left: 106, right: 106,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Write 512x512
    await sharp(baseIcon).resize(512, 512).toFile(out512);

    // Write player logo (also 512x512)
    await sharp(baseIcon).resize(512, 512).toFile(outPlayer);

    // Write 192x192
    await sharp(baseIcon).resize(192, 192).toFile(out192);

    // Write Apple Touch Icon (180x180)
    await sharp(baseIcon).resize(180, 180).toFile(outApple);

    // Write the new app/icon.png favicon
    await sharp(baseIcon).resize(192, 192).toFile(path.join(__dirname, 'app', 'icon.png'));

    console.log('Successfully scaled all PWA icons to 3x!');
  } catch (err) {
    console.error('Error scaling icons:', err);
  }
}

scaleIcons();
