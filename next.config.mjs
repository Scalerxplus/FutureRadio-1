import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TZ: "Asia/Kolkata",
  },
  experimental: {
    serverComponentsExternalPackages: ["yt-search", "cheerio", "ws", "node-edge-tts"],
    outputFileTracingExcludes: {
      "api/**/*": ["public/audio/**/*", "public/images/**/*", "public/logo-watermark.png", "public/local_audio_vault/**/*"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
