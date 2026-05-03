import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// Only apply Serwist if we are not using Turbopack, as Turbopack 
// does not yet support custom webpack configurations used for service workers.
export default process.env.TURBOPACK ? nextConfig : withSerwist(nextConfig);
