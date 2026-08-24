import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiOrigin = apiUrl ? new URL(apiUrl).origin : undefined;

const connectSources = [
  "'self'",
  apiOrigin,
  "https://api.razorpay.com",
].filter(Boolean).join(" ");

  // JavaScript
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com"
    : "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com";

const contentSecurityPolicy = [
  // Default
  "default-src 'self'",

  // JavaScript (env-aware)
  scriptSrc,
  "script-src-attr 'none'",
  // Styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",

  // Fonts
  "font-src 'self' https://fonts.gstatic.com",

  // Images
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",

  // API Connections
  `connect-src ${connectSources}`,

  // Media
  "media-src 'self'",

  // Workers
  "worker-src 'self' blob:",

  // Manifest
  "manifest-src 'self'",

  // Frames
  "frame-src https://checkout.razorpay.com https://api.razorpay.com",
  "frame-ancestors 'none'",

  // Forms
  "form-action 'self'",

  // Base URI
  "base-uri 'self'",

  // Plugins
  "object-src 'none'",

  // Upgrade insecure requests
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=()",
              "autoplay=()",
              "camera=()",
              "clipboard-read=(self)",
              "clipboard-write=(self)",
              "display-capture=()",
              "fullscreen=()",
              "geolocation=()",
              "gyroscope=()",
              "magnetometer=()",
              "microphone=()",
              "midi=()",
              "payment=(self)",
              "usb=()",
              "xr-spatial-tracking=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;