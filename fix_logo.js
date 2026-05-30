const sharp = require('sharp');

async function fix() {
  try {
    const infoObj = await sharp('public/logo-horizontal.png').metadata();
    const w = infoObj.width;
    const h = infoObj.height;
    
    // We need the raw data to process it
    const { data } = await sharp('public/logo-horizontal.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
      
    // Find top, bottom, left, right bounds of the actual logo (non-white pixels)
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (!(r > 240 && g > 240 && b > 240)) { // non-white
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`Bounds: X:[${minX}, ${maxX}], Y:[${minY}, ${maxY}]`);
    
    // The vinyl is a circle on the left.
    const logoH = maxY - minY;
    const radius = logoH / 2;
    const centerX = minX + radius;
    const centerY = minY + radius;
    console.log(`Vinyl Center: (${centerX}, ${centerY}), Radius: ${radius}`);

    // Now create the image
    const outData = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        
        let outR = r, outG = g, outB = b, outA = 255;
        
        const isWhite = r > 240 && g > 240 && b > 240;
        const isRed = r > 150 && g < 100 && b < 100;
        const isDark = !isWhite && !isRed;
        
        if (isWhite) {
           // Is it inside the vinyl?
           const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
           // Only keep white if it's strictly inside the vinyl by a safe margin (e.g., 90% of radius)
           if (dist < radius * 0.95) {
              outR = 255; outG = 255; outB = 255; outA = 255; 
           } else {
              outA = 0; // transparent bg
           }
        } else if (isRed) {
           // Make 'O' and waves white
           outR = 255; outG = 255; outB = 255; 
           outA = Math.max(0, 255 - Math.min(g, b));
        } else if (isDark) {
           const lum = 0.299 * r + 0.587 * g + 0.114 * b;
           const textAlpha = Math.max(0, 255 - lum);
           
           // Vinyl is black. Vinyl area is roughly x < centerX + radius * 1.5
           if (x < centerX + radius * 1.5) {
              outR = 0; outG = 0; outB = 0; outA = textAlpha; // keep vinyl black
           } else {
              // Text area
              // FUTURE vs RADI. Split at centerY
              if (y < centerY) {
                 // FUTURE -> White
                 outR = 255; outG = 255; outB = 255; outA = textAlpha;
              } else {
                 // RADI -> Black
                 outR = 0; outG = 0; outB = 0; outA = textAlpha;
              }
           }
        }
        
        outData[idx] = outR; outData[idx+1] = outG; outData[idx+2] = outB; outData[idx+3] = outA;
      }
    }
    
    await sharp(outData, { raw: { width: w, height: h, channels: 4 } }).png().toFile('public/logo-custom.png');
    console.log('Fixed logo-custom.png');
  } catch (e) {
    console.error(e);
  }
}

fix();
