import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  transpilePackages: ["@yilangaodesign/design-system"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lrjliluvnkciwnyshexq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
