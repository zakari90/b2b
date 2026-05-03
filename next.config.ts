import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Disable Serwist (webpack plugin) when Turbopack is active to prevent build conflicts on Vercel.
const isTurbopack = Boolean(
  process.env.TURBOPACK ||
  process.env.NEXT_TURBOPACK ||
  process.env.npm_lifecycle_script?.includes("--turbo")
);

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isTurbopack || process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Declaring an empty turbopack config silences the "webpack config detected" warning
  // when Vercel runs the build without --webpack explicitly set.
  turbopack: {},
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/workbox-:path(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/swe-worker-:path(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default withSerwist(nextConfig);
