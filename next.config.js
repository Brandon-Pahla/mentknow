/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["liveblocks.io", 'lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Modify Webpack configuration for the client-side build
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        dns: false,
        module: false,
        readline: false,
        child_process: false,
      };
    }

    return config;
  },
};
