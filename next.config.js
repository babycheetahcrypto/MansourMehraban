/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com'
      // Add other domains you use
    ]
  }
};

module.exports = nextConfig;