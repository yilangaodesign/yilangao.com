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
    ],
  },
};

export default withPayload(nextConfig);
