/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

export default nextConfig