/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Use standalone output format but customize the path to avoid cleanup issues
  output: 'standalone',
  distDir: process.env.CI ? '.next-ci' : '.next',
  experimental: {} // Keep empty experimental to avoid warnings
};

module.exports = nextConfig;
