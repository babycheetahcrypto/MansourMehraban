/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Add this line for Vercel deployment
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com'
      // Add other domains you use
    ]
  }
};

module.exports = nextConfig;