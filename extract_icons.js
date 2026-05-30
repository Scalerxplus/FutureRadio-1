const sharp = require('sharp');

async function processIcons() {
  try {
    const { data, info } = await sharp('public/logo-horizontal.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const numPixels = info.width * info.height;
    const cleanData = Buffer.alloc(numPixels * 4);
    
    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      let r = data[idx];
      let g = data[idx+1];
      let b = data[idx+2];
      
      // Convert Red to Grayscale to map it to Black
      if (r > g + 50 && r > b + 50) {
        r = g; 
      }
      
      // Grayscale luminance
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Increase contrast
      lum = (lum - 128) * 1.5 + 128;
      if (lum > 255) lum = 255;
      if (lum < 0) lum = 0;
      
      cleanData[idx] = 0;
      cleanData[idx+1] = 0;
      cleanData[idx+2] = 0;
      cleanData[idx+3] = 255 - lum; // alpha
    }

    await sharp(cleanData, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toFile('public/logo-transparent.png');
    console.log('Created logo-transparent.png');

    // For icons, we can just use the transparent logo and crop it.
    // Vinyl is approx left 20%
    const vinylSize = Math.floor(info.height * 0.9);
    await sharp('public/logo-transparent.png')
      .extract({ left: Math.floor(info.height * 0.05), top: Math.floor(info.height * 0.05), width: vinylSize, height: vinylSize })
      .toFile('public/vinyl-icon.png');
    console.log('Created vinyl-icon.png');

    // Favicon 'O' is approx right side
    await sharp('public/logo-transparent.png')
      .extract({ left: info.width - vinylSize - Math.floor(info.height * 0.1), top: Math.floor(info.height * 0.1), width: vinylSize, height: Math.floor(vinylSize*0.8) })
      .toFile('public/favicon.png');
    console.log('Created favicon.png');

  } catch (e) {
    console.error(e);
  }
}

processIcons();
