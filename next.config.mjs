/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["yt-search", "cheerio", "ws", "node-edge-tts"],
  },
};

export default nextConfig;
