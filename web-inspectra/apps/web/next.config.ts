import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["d3", "framer-motion", "@xyflow/react"],
  },
};

export default nextConfig;
