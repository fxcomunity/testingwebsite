/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg', 'nodemailer', 'bcryptjs']
  }
}
module.exports = nextConfig
