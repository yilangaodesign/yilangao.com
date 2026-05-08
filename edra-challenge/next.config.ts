import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  sassOptions: {
    loadPaths: [path.resolve(monorepoRoot, "src/styles")],
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;
