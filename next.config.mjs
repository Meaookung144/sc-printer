/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  output: 'standalone',
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

export default nextConfig