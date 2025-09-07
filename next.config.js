/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features that don't work with static export
  // Ensure static files are properly handled
  assetPrefix: './',
}

module.exports = nextConfig
