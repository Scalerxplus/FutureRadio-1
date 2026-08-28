require('dotenv').config();
const puppeteer = require('puppeteer-core');
const { getStream } = require('puppeteer-stream');
const { spawn } = require('child_process');

const TARGET_URL = process.env.TARGET_URL || 'https://www.thefutureradio.com/radio';
const YOUTUBE_RTMP_KEY = process.env.YOUTUBE_RTMP_KEY;

if (!YOUTUBE_RTMP_KEY) {
  console.error("FATAL: YOUTUBE_RTMP_KEY environment variable is not set!");
  process.exit(1);
}

const RTMP_URL = `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_RTMP_KEY}`;

async function startStream() {
  console.log("Starting Headless Browser...");
  
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    defaultViewport: { width: 1920, height: 1080 },
    headless: false, // Must be false to use puppeteer-stream, Xvfb will hide it
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1920,1080',
      '--window-position=0,0',
      '--start-fullscreen',
      '--kiosk',
      '--disable-gpu', // Use CPU for rendering
      '--hide-scrollbars'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Inject a premium animated background and scale the radio player
  console.log("Injecting premium visual styles...");
  await page.addStyleTag({
    content: `
      body {
        background: linear-gradient(-45deg, #FFB6C1, #98FB98, #FFD1DC, #FFFDD0) !important;
        background-size: 400% 400% !important;
        animation: gradientBG 15s ease infinite !important;
      }
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      /* Optional: scale up the main player slightly to fill 1080p better */
      .max-w-\\[420px\\] {
        transform: scale(1.15);
        transform-origin: center center;
        box-shadow: 20px 20px 0px 0px rgba(0,0,0,1) !important;
      }
    `
  });

  // Auto-click the center of the page to trigger any unlock audio gestures
  console.log("Simulating user interaction to unlock audio engine...");
  await page.mouse.click(960, 540);
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to find and click the Play Radio button
  try {
    const playBtn = await page.$('button[aria-label="Play Radio"]');
    if (playBtn) {
      console.log("Found Play Radio button, clicking it...");
      await playBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch(e) {}

  // Also try clicking anywhere that says "Bagheli Vibe" or "Bagheli" if it's a tab
  try {
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, div, span'));
      const bagheliEl = elements.find(el => el.textContent && el.textContent.toLowerCase().includes('bagheli vibe'));
      if (bagheliEl && typeof bagheliEl.click === 'function') {
        bagheliEl.click();
      }
    });
  } catch(e) {}
  
  console.log("Spawning FFmpeg for X11 grab...");
  const display = process.env.DISPLAY || ':99';
  const ffmpegArgs = [
    '-loglevel', 'info',
    
    // Video input
    '-f', 'x11grab',
    '-video_size', '1920x1080',
    '-framerate', '30',
    '-i', display,
    
    // Audio input
    '-f', 'pulse',
    '-i', 'default',
    
    // Video Encoding
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', '4500k',
    '-maxrate', '4500k',
    '-bufsize', '9000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60', // Keyframe interval (2s for 30fps)
    
    // Audio Encoding
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    
    // Output format
    '-f', 'flv',
    RTMP_URL
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);
  console.log("STREAM IS LIVE!");

  ffmpeg.stdout.on('data', (data) => {
    console.log(`[FFmpeg] ${data.toString()}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.log(`[FFmpeg] ${data.toString()}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`[FFmpeg] Process exited with code ${code}. Re-spawning in 10s...`);
    setTimeout(() => {
        browser.close();
        startStream();
    }, 10000);
  });
  console.log("STREAM IS LIVE!");
}

startStream().catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});
