const sharp = require('sharp');

async function processDarkLogo() {
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
      
      // Default alpha is 255 (opaque)
      let a = 255;
      
      // If it's a red pixel (high red, lower green/blue)
      if (r > g + 50 && r > b + 50) {
        // Keep it red, opaque
        cleanData[idx] = r;
        cleanData[idx+1] = g;
        cleanData[idx+2] = b;
        cleanData[idx+3] = 255;
      } else {
        // It's grayscale (black text or white background)
        // For dark theme logo, we want the black text to become white,
        // and the white background to become transparent.
        // Luminance tells us how bright the pixel is.
        // lum = 255 (white) -> we want transparent (alpha = 0)
        // lum = 0 (black) -> we want white (RGB=255) and opaque (alpha = 255)
        
        let lum = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Enhance contrast
        lum = (lum - 128) * 1.5 + 128;
        if (lum > 255) lum = 255;
        if (lum < 0) lum = 0;
        
        // We set the pixel color to pure white
        cleanData[idx] = 255;
        cleanData[idx+1] = 255;
        cleanData[idx+2] = 255;
        
        // Alpha is inversely proportional to luminance
        // Dark pixels get high alpha (visible white), bright pixels get low alpha (transparent)
        cleanData[idx+3] = 255 - lum;
      }
    }

    await sharp(cleanData, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toFile('public/logo-dark-theme.png');
    console.log('Created logo-dark-theme.png');

  } catch (e) {
    console.error(e);
  }
}

processDarkLogo();
