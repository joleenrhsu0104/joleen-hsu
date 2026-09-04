import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project directory.
  // A stray package-lock.json exists in the parent (~/) so
  // Turbopack was inferring the workspace root as the home
  // directory and printing a warning at dev-server startup.
  turbopack: {
    root: path.resolve(__dirname),
  },
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
