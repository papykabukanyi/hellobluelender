/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  output: 'standalone', // Optimized for Railway deployment
  
  // Make sure SWC is used for the build
  swcMinify: true,
  
  // Experimental features to handle file system issues
  experimental: {
    // This helps with Windows file locking issues
    caseSensitiveRoutes: false,
    // Better error handling for standalone builds
    outputFileTracingRoot: process.cwd(),
  },
};

export default nextConfig;
