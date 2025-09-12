const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: false,
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1', 'localhost', 'quilt-b3dec.appspot.com'],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*', // Apply to all API routes
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Change to specific origin if needed
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Shopify-Access-Token, Content-Type',
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
