require('dotenv').config();
const puppeteer = require('puppeteer-core');
const { getStream } = require('puppeteer-stream');
const { spawn } = require('child_process');

const TARGET_URL = process.env.TARGET_URL || 'https://futureradio.vercel.app';
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
      '--disable-gpu', // Use CPU for rendering
      '--hide-scrollbars',
      '--mute-audio' // Mute host audio out to prevent loopback issues, puppeteer-stream still captures tab audio
    ]
  });

  const page = await browser.newPage();
  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Auto-click the center of the page to trigger any unlock audio gestures
  console.log("Simulating user interaction to unlock audio engine...");
  await page.mouse.click(960, 540);
  await new Promise(r => setTimeout(r, 2000));

  console.log("Capturing stream via puppeteer-stream...");
  const stream = await getStream(page, { audio: true, video: true, frameSize: 1000 });
  
  console.log("Spawning FFmpeg...");
  const ffmpegArgs = [
    '-i', '-', // Read from stdin
    
    // Video Encoding
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', '3000k',
    '-maxrate', '3000k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '50', // Keyframe interval (2 seconds for 25fps)
    '-r', '25', // Frame rate
    
    // Audio Encoding
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    
    // Output Format
    '-f', 'flv',
    RTMP_URL
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  // Pipe the browser stream directly into FFmpeg
  stream.pipe(ffmpeg.stdin);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`[FFmpeg] ${data.toString()}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}. Re-spawning in 10s...`);
    setTimeout(() => {
        stream.destroy();
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
