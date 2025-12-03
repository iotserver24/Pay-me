import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

const proxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
    changeOrigin: true,
    // No pathRewrite needed, we want /api/... -> /api/...
    onProxyReq: (proxyReq, req, res) => {
        // You can add custom headers here if needed
    },
});

export default function handler(req, res) {
    proxy(req, res, (result) => {
        if (result instanceof Error) {
            throw result;
        }
    });
}
