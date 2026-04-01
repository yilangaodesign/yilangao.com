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
};

export default nextConfig;
