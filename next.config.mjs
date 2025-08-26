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
}

export default nextConfig