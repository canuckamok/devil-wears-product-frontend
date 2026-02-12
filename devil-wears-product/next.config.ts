import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.fourthwall.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fourthwall.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
