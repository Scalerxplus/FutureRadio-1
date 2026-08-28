# Future Radio - YouTube Live Streamer (Oracle Cloud ARM64)

This folder contains a fully Dockerized, Headless Chromium + FFmpeg streaming engine designed to run 24/7 on an Oracle Cloud Always Free ARM VPS.

## How It Works
The engine uses Xvfb (Virtual Framebuffer) to launch a headless Chromium instance, navigates to your Vercel-hosted radio URL, auto-clicks to unlock the Web Audio API, captures the MediaStream using `puppeteer-stream`, and routes it directly into FFmpeg to push an RTMP feed to YouTube.

---

## Deployment Steps on Oracle Cloud

### 1. SSH into your Oracle Cloud instance
```bash
ssh ubuntu@YOUR_ORACLE_IP_ADDRESS -i /path/to/your/ssh_key
```

### 2. Install Docker and Docker-Compose (if not already installed)
```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
```
*(Log out and log back in to apply the docker group changes)*

### 3. Clone this repository
```bash
git clone https://github.com/prameeshmishra/FutureRadio.git
cd FutureRadio/streamer
```

### 4. Create the Environment File
Create a `.env` file in the `streamer` directory and add your YouTube Stream Key:
```bash
nano .env
```
Add the following lines (replace `YOUR_STREAM_KEY` with your actual YouTube RTMP key):
```env
YOUTUBE_RTMP_KEY=YOUR_STREAM_KEY
TARGET_URL=https://futureradio.vercel.app/admin/schedule?city=bagheli
```
*Note: Make sure the TARGET_URL points to the exact URL of the player you want to broadcast.*

### 5. Build and Start the Docker Container
```bash
docker-compose build
docker-compose up -d
```

### 6. Monitor the Stream
To check the logs and ensure FFmpeg is streaming successfully without errors:
```bash
docker logs -f future-radio-streamer
```

## Troubleshooting
- **Stream freezes or crashes**: Ensure your VPS has at least 4GB of RAM allocated. The `docker-compose.yml` mounts `/dev/shm` to prevent Puppeteer from crashing due to shared memory limits.
- **Audio not playing**: The `stream.js` script clicks exactly in the center of the screen `(960, 540)` to unlock the audio context. Make sure your UI doesn't have an overlay blocking this click.
