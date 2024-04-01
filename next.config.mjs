/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        // 可选地，你还可以添加pathname来进一步限制匹配的路径
        // pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
};

export default nextConfig;
