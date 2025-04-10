import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false; // Disable caching
    }
    return config;
  },
};

module.exports = {
    compiler: {
        removeConsole: true,
    },
}

export default nextConfig;
