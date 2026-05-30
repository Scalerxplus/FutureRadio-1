const sharp = require('sharp');

async function createCustomLogo() {
  try {
    const { data, info } = await sharp('public/logo-horizontal.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const outData = Buffer.alloc(w * h * 4);
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const a = data[idx+3];
        
        let outR = r;
        let outG = g;
        let outB = b;
        let outA = 255;
        
        const isWhite = r > 240 && g > 240 && b > 240;
        const isRed = r > 150 && g < 100 && b < 100;
        const isDark = !isWhite && !isRed;
        
        if (x < w * 0.28) {
          // --- VINYL AREA ---
          if (isWhite) {
            const centerX = w * 0.14;
            const centerY = h * 0.5;
            const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            if (dist > h * 0.45) {
               outA = 0; 
            } else {
               // White elements inside the vinyl
               outR = 255; outG = 255; outB = 255; outA = 255;
               // Smooth the edges of the white circle to prevent jaggedness
               if (dist > h * 0.40) {
                 outA = Math.max(0, 255 - (dist - h * 0.40) * 20);
               }
            }
          } else if (isDark) {
            // Keep it black
            outR = 0; outG = 0; outB = 0; outA = 255;
          } else if (isRed) {
            // There shouldn't be red here, but just in case
            outR = r; outG = g; outB = b; outA = 255;
          }
        } else {
          // --- TEXT AREA ---
          if (isWhite) {
            outA = 0;
          } else if (isRed) {
            // 'O' and waves. User wants them WHITE.
            outR = 255; outG = 255; outB = 255;
            outA = Math.max(0, 255 - Math.min(g, b));
          } else if (isDark) {
            // 'FUTURE' is top, 'RADI' is bottom
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const textAlpha = Math.max(0, 255 - lum);
            
            if (y < h * 0.52) {
              // 'FUTURE' -> White
              outR = 255; outG = 255; outB = 255;
              outA = textAlpha;
            } else {
              // 'RADI' -> Black
              outR = 0; outG = 0; outB = 0;
              outA = textAlpha;
            }
          }
        }
        
        outData[idx] = outR;
        outData[idx+1] = outG;
        outData[idx+2] = outB;
        outData[idx+3] = outA;
      }
    }

    await sharp(outData, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile('public/logo-custom.png');
      
    console.log('Created logo-custom.png');
  } catch (e) {
    console.error(e);
  }
}

createCustomLogo();
