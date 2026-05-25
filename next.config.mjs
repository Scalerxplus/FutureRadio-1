/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TZ: "Asia/Kolkata",
  },
  experimental: {
    serverComponentsExternalPackages: ["yt-search", "cheerio", "ws", "node-edge-tts"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
