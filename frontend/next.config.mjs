/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // Match any pathname from picsum.photos
        },
      ],
    },
  };
  
  export default nextConfig;