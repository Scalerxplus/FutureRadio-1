const sharp = require('sharp');

async function processLogo() {
  try {
    const infoObj = await sharp('public/logo-horizontal.png').metadata();
    const w = infoObj.width;
    const h = infoObj.height;
    
    const { data } = await sharp('public/logo-horizontal.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
      
    // 1. Find the bounds of the vinyl (for region-based coloring later)
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
    const logoH = maxY - minY;
    const radius = logoH / 2;
    const centerX = minX + radius;
    const centerY = minY + radius;

    // Output buffers
    const outTransparent = Buffer.alloc(w * h * 4);
    const outDarkTheme = Buffer.alloc(w * h * 4);
    const outCustom = Buffer.alloc(w * h * 4);

    // Bounding box for O Icon
    let oMinX = w, oMaxX = 0, oMinY = h, oMaxY = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        
        // --- STEP 1: Perfect Background Removal ---
        const w_val = Math.min(r, g, b);
        let a = 1.0 - (w_val / 255.0);
        
        let fr = 255, fg = 255, fb = 255;
        if (a > 0.01) {
          fr = Math.min(255, Math.max(0, (r - 255 * (1 - a)) / a));
          fg = Math.min(255, Math.max(0, (g - 255 * (1 - a)) / a));
          fb = Math.min(255, Math.max(0, (b - 255 * (1 - a)) / a));
        } else {
          a = 0; // Pure white background
        }
        
        // Restore white vinyl details (they get lost because they are white like the bg)
        if (a < 0.01) {
           const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
           if (dist < radius * 0.95 && r > 240 && g > 240 && b > 240) {
               fr = 255; fg = 255; fb = 255; a = 1.0; 
           }
        }
        
        // Write base transparent logo
        outTransparent[idx] = fr;
        outTransparent[idx+1] = fg;
        outTransparent[idx+2] = fb;
        outTransparent[idx+3] = Math.round(a * 255);

        // Track O Icon bounds (red part on the right)
        const isRed = fr > 150 && fg < 100 && fb < 100;
        if (a > 0.1 && isRed && x > centerX + radius * 2) {
            if (x < oMinX) oMinX = x;
            if (x > oMaxX) oMaxX = x;
            if (y < oMinY) oMinY = y;
            if (y > oMaxY) oMaxY = y;
        }

        // --- STEP 2: Dark Theme Logo ---
        // Vinyl area: Unchanged (Black disc, red/white details).
        // Text area: Convert black text to white.
        let dr = fr, dg = fg, db = fb, da = a;
        if (da > 0.01 && x > centerX + radius * 1.1) {
            const isDark = fr < 100 && fg < 100 && fb < 100;
            if (isDark) {
                dr = 255; dg = 255; db = 255;
            }
        }
        
        outDarkTheme[idx] = dr;
        outDarkTheme[idx+1] = dg;
        outDarkTheme[idx+2] = db;
        outDarkTheme[idx+3] = Math.round(da * 255);

        // --- STEP 3: Custom Logo (Splash Screen) ---
        // Vinyl area: Unchanged (Black disc, red/white details).
        // Text area: "FUTURE" -> White, "RADI" -> Black, "O/waves" -> White
        let cr = fr, cg = fg, cb = fb, ca = a;
        
        if (ca > 0.01 && x > centerX + radius * 1.1) {
           if (isRed) {
              // O and waves -> White
              cr = 255; cg = 255; cb = 255;
           } else {
              const isDark = fr < 100 && fg < 100 && fb < 100;
              if (isDark && y < centerY) {
                 // FUTURE -> White
                 cr = 255; cg = 255; cb = 255;
              }
              // RADI is already black, keep it black
           }
        }
        
        outCustom[idx] = cr;
        outCustom[idx+1] = cg;
        outCustom[idx+2] = cb;
        outCustom[idx+3] = Math.round(ca * 255);
      }
    }
    
    // Save generated logos
    await sharp(outTransparent, { raw: { width: w, height: h, channels: 4 } }).png().toFile('public/logo-transparent.png');
    await sharp(outDarkTheme, { raw: { width: w, height: h, channels: 4 } }).png().toFile('public/logo-dark-theme.png');
    await sharp(outCustom, { raw: { width: w, height: h, channels: 4 } }).png().toFile('public/logo-custom.png');
    
    // Create red-o-icon by cropping outTransparent
    const pad = 10;
    const cropX = Math.max(0, oMinX - pad);
    const cropY = Math.max(0, oMinY - pad);
    const cropW = Math.min(w - cropX, oMaxX - oMinX + pad * 2);
    const cropH = Math.min(h - cropY, oMaxY - oMinY + pad * 2);
    
    await sharp('public/logo-transparent.png')
        .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
        .png()
        .toFile('public/red-o-icon.png');

    console.log('Successfully generated perfect anti-aliased logos with correct vinyl colors!');
  } catch (e) {
    console.error(e);
  }
}

processLogo();
