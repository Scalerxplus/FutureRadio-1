const sharp = require('sharp');

async function extract() {
  try {
    const info = await sharp('public/logo-dark-theme.png').metadata();
    
    // The vinyl is on the left (about height * 0.9 width).
    // The 'O' is on the far right. Let's crop the rightmost part.
    // The height of the original image is 500, width is 2000 for example.
    // The 'O' is approximately square.
    const size = Math.floor(info.height * 0.85);
    await sharp('public/logo-dark-theme.png')
      .extract({ 
        left: info.width - size - Math.floor(info.height * 0.05), 
        top: Math.floor(info.height * 0.1), 
        width: size, 
        height: size 
      })
      .toFile('public/red-o-icon.png');
      
    console.log('Extracted red-o-icon.png');
  } catch (e) {
    console.error(e);
  }
}

extract();
