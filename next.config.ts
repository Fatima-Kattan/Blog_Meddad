// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // عطل أثناء التطوير
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production', // إزالة console.log
    },
    eslint: {
        ignoreDuringBuilds: true, // تجاهل ESLint أثناء التطوير
    },
    typescript: {
        ignoreBuildErrors: true, // تجاهل أخطاء TypeScript
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
        
        deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        formats: ['image/webp'],
        minimumCacheTTL: 60,
    },
    
    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },
};

module.exports = nextConfig;