/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable sharp optimization in Docker builds to avoid musl issues
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
  experimental: {}, // Keep empty to avoid warnings
  
  // Environment variables for client-side
  env: {
    DOCKER_BUILD: process.env.DOCKER_BUILD || 'false',
  },
  
  // Webpack configuration to handle sharp and leaflet issues
  webpack: (config, { isServer }) => {
    // Handle sharp issues in Docker builds
    if (isServer && process.env.DOCKER_BUILD) {
      config.externals = config.externals || [];
      config.externals.push({
        'sharp': 'commonjs sharp',
        'canvas': 'commonjs canvas'
      });
    }
    
    // Ignore problematic modules during build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
    };
    
    // Handle react-leaflet-cluster assets more gracefully
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/images/[hash][ext][query]'
      }
    });
    
    return config;
  },
  
  // Disable automatic cleanup to prevent ENOTEMPTY errors
  cleanDistDir: false,
};

module.exports = nextConfig;
