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
    // Files imported via @ds/* live in ../src/ — outside playground/.
    // Node module resolution walks up from the file's directory, so it
    // never reaches playground/node_modules/. Prepending it here ensures
    // webpack can resolve shared deps for out-of-tree source files.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;
