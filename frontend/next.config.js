/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
}

module.exports = nextConfig
