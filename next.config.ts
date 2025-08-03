import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://**.public.blob.vercel-storage.com/uploads/**"),
    ],
  },
};

export default nextConfig;
