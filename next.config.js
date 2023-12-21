const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // webpack: (config) => {
  //   // Existing fallback settings
  //   config.resolve.fallback = { 
  //     ...config.resolve.fallback, // Keep existing fallbacks
  //     fs: false, 
  //     net: false, 
  //     tls: false,
  //     http: require.resolve('http-browserify'),
  //     https: require.resolve('https-browserify'),
  //     stream: require.resolve('stream-browserify'),
  //     crypto: require.resolve('crypto-browserify'),
  //   };

  //   // Add ProvidePlugin to plugins
  //   config.plugins.push(
  //     new webpack.ProvidePlugin({
  //       Buffer: ['buffer', 'Buffer'],
  //       process: 'process/browser',
  //     })
  //   );

  //   return config;
  // },
  images: {
    domains: ['raw.githubusercontent.com', 'assets.rubic.exchange','app.rubic.exchange', '65809abe70b5410a08804127--fanciful-peony-4aeb4e.netlify.app'],
  },
};

module.exports = nextConfig;
