import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isStaticExport = 'false';
const isDev = process.env.NODE_ENV !== 'production';
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: true },
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  modularizeImports: {
    '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
    '@mui/material': { transform: '@mui/material/{{member}}' },
    '@mui/lab': { transform: '@mui/lab/{{member}}' },
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      ...(firebaseStorageBucket
        ? [{ protocol: 'https', hostname: firebaseStorageBucket }]
        : []),
    ],
    unoptimized: true,
  },
  // Silence Next 16 turbopack/webpack config mismatch by explicitly opting in.
  turbopack: {},
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Shopify-Access-Token, Content-Type' },
        ],
      },
    ];
  },
  webpack(config, { dev }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
