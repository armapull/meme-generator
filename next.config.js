/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments (optional)
  // Uncomment the line below if deploying with Docker
  // output: 'standalone',
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    // Fix for InstantDB and other client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
