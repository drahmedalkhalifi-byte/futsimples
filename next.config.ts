import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — blocks the site from being embedded in iframes on other domains
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browser from guessing content types (MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Force HTTPS for 1 year (only sent over HTTPS connections)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Limit referrer info sent to other sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features (camera, mic, etc.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
