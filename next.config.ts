import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
