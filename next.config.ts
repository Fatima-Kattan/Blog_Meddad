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
    },
};

module.exports = nextConfig;