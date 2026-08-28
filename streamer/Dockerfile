# Use official Node.js image based on Debian
FROM node:20-bookworm-slim

# Install dependencies for Chromium, FFmpeg, Pulseaudio, and Xvfb
# Adding dependencies specifically required for ARM64 and Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    ffmpeg \
    xvfb \
    dbus \
    dbus-x11 \
    libx11-xcb1 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Set environment variables for Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Ensure xvfb-run script is executable
RUN chmod +x stream.js

# Expose display for xvfb
ENV DISPLAY=:99

# Run the streamer
CMD ["npm", "start"]
