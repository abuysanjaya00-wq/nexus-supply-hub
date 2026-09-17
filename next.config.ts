import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep SheetJS on the Node side for Server Actions / Route Handlers
  serverExternalPackages: ["xlsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
