/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [{ 
      protocol: "https", 
      hostname: "cmlabs-co.s3.ap-southeast-1.amazonaws.com" 
    }],
  },
};

export default nextConfig; // Ganti withNextIntl(nextConfig) menjadi ini