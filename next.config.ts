import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Changed to false: It's important to fix TS errors for production.
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed to false: It's important to fix ESLint errors/warnings.
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone', // Added for optimized Docker builds
};

export default nextConfig;
