/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable sharp optimization in Docker builds
    unoptimized: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use standalone output format for deployment
  output: 'standalone',
  experimental: {}, // Keep empty experimental to avoid warnings
  
  // Webpack configuration to handle problematic packages
  webpack: (config, { isServer }) => {
    // Handle leaflet and sharp issues in Docker
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'sharp': 'commonjs sharp',
        'canvas': 'commonjs canvas'
      });
    }
    
    // Ignore canvas and sharp warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
