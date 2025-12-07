import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isStaticExport = 'false';
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: true },
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
    domains: [
      '127.0.0.1',
      'localhost',
      'black-river-market-b3dec.appspot.com',
      'firebasestorage.googleapis.com',
    ],
    unoptimized: true,
  },
  turbopack: {
    // Force correct workspace root for Firebase frameworks builder and silence Turbopack/webpack mismatch warnings.
    rootDirectory: __dirname,
  },
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
