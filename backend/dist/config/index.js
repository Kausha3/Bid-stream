import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Anti-sniping: extend auction by this many ms if bid placed in final seconds
    antiSnipingThreshold: 15000, // 15 seconds
    antiSnipingExtension: 15000, // 15 seconds
};
