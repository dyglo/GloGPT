/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    XAI_API_KEY: process.env.XAI_API_KEY,
  },
}

module.exports = nextConfig