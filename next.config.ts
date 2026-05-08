import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/work/elan-design-system',
        destination: '/work/engram',
        permanent: true,
      },
    ];
  },
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Lexical 0.41.0's "node" conditional export uses top-level await with
      // dynamic import. Webpack can't statically determine named exports for
      // `export *` re-exports through that pattern, breaking the proxy in
      // @payloadcms/richtext-lexical. Alias to the static ESM entry instead.
      const resolved = require.resolve('@lexical/html');
      config.resolve.alias['@lexical/html'] = resolved.replace(
        /LexicalHtml\.\w+$/,
        'LexicalHtml.mjs',
      );
    }
    return config;
  },
};

export default withPayload(nextConfig);
