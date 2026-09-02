require('dotenv').config();
const puppeteer = require('puppeteer-core');
const { getStream } = require('puppeteer-stream');
const { spawn } = require('child_process');

const TARGET_URL = process.env.TARGET_URL || 'https://www.thefutureradio.com/youtube';
const YOUTUBE_RTMP_KEY = process.env.YOUTUBE_RTMP_KEY;
const FACEBOOK_RTMP_KEY = process.env.FACEBOOK_RTMP_KEY;

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

  const timestampUrl = `${TARGET_URL}?t=${Date.now()}`;
  console.log(`Navigating to ${timestampUrl}...`);

  // Navigate to URL
  await page.goto(timestampUrl, { waitUntil: 'networkidle2' });

  // Auto-click the center of the page to trigger unlock audio gestures
  console.log("Simulating user interaction to unlock audio engine...");
  await page.mouse.click(960, 540);
  await new Promise(r => setTimeout(r, 2000));

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
    '-b:v', '4000k',
    '-maxrate', '4000k',
    '-bufsize', '8000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60', // Keyframe interval (2s for 30fps)
    
    // Audio Encoding
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100'
  ];

  if (FACEBOOK_RTMP_KEY) {
    console.log("FACEBOOK_RTMP_KEY detected. Enabling Simulcast to Facebook via tee muxer...");
    const FB_RTMP_URL = `rtmps://live-api-s.facebook.com:443/rtmp/${FACEBOOK_RTMP_KEY}`;
    ffmpegArgs.push(
      '-f', 'tee',
      '-map', '0:v',
      '-map', '1:a',
      `[f=flv]${RTMP_URL}|[f=flv]${FB_RTMP_URL}`
    );
  } else {
    ffmpegArgs.push(
      '-f', 'flv',
      RTMP_URL
    );
  }

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
