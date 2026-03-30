import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  transpilePackages: ["@yilangaodesign/design-system"],
};

export default withPayload(nextConfig);
