/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  output: 'standalone', // Required for Docker deployment
  
  // Force App Router only (disable Pages Router)
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
