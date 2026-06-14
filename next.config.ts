import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Figma's MCP asset URLs while we're using temporary
  // hot-linked images from the Figma file. Once images are
  // exported and moved into /public/images/, this can be removed.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
  },
};

export default nextConfig;
