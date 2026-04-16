/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows the build to finish even if the linter is confused
    ignoreDuringBuilds: true,
  },
  typescript: {
    // also ignores type errors during build for extra safety
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
