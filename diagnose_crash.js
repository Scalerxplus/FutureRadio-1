const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capture and print console messages
    page.on('console', msg => {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('PAGE ERROR:', error.message);
    });
    
    page.on('requestfailed', request => {
      console.error(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log('Page loaded successfully. Checking for react errors...');
    
    // Wait a bit to see if any delayed errors pop up
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER ERROR:', err);
  }
})();
