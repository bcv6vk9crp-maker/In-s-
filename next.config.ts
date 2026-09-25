import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Images déjà réduites à 1600 px dans le navigateur (quelques centaines de Ko).
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
